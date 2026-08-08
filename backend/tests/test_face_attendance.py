"""Backend tests for Qaans ERP face-attendance flow.

Covers:
 - POST /api/employees/{emp_id}/enroll-face  (auth, 422 on no-face, happy path)
 - POST /api/attendance/match  (auth, invalid b64 -> 400, matches self after enroll)
"""
from __future__ import annotations

import base64
import io
import os
import sys
from datetime import datetime, timedelta, timezone
from urllib.request import Request, urlopen

import pytest
import requests
from dotenv import load_dotenv
from PIL import Image

# Load env & make backend importable so we can seed the OTP row directly
load_dotenv("/app/backend/.env")
load_dotenv("/app/frontend/.env")  # for EXPO_PUBLIC_BACKEND_URL
sys.path.insert(0, "/app/backend")

from server import (  # noqa: E402
    Employee,
    OtpCode,
    SessionLocal,
    Supervisor,
    password_hash,
)

BASE_URL = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/") + "/api"


# ---------- fixtures ----------
@pytest.fixture(scope="session")
def token() -> str:
    """Seed OTP row for supervisor with known code '123456' then verify."""
    with SessionLocal() as db:
        sup = db.query(Supervisor).first()
        assert sup, "no supervisor row seeded"
        email = sup.email
        db.query(OtpCode).filter(OtpCode.email == email.lower()).delete()
        db.add(
            OtpCode(
                email=email.lower(),
                code_hash=password_hash.hash("123456"),
                expires_at=datetime.now(timezone.utc).replace(tzinfo=None)
                + timedelta(minutes=5),
                attempts=0,
            )
        )
        db.commit()

    r = requests.post(
        f"{BASE_URL}/auth/verify-otp",
        json={"email": email, "otp": "123456"},
        timeout=60,
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def headers(token) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def ramesh_id() -> str:
    with SessionLocal() as db:
        emp = db.query(Employee).filter(Employee.code == "DHD-1042").first()
        assert emp, "DHD-1042 not seeded"
        return emp.id


@pytest.fixture(scope="session")
def ramesh_face_b64() -> str:
    """Download Ramesh Kumar's stock photo and return as base64 JPEG."""
    with SessionLocal() as db:
        emp = db.query(Employee).filter(Employee.code == "DHD-1042").first()
        url = emp.photo
    # If already a data URL (previous enroll), strip prefix and return
    if url.startswith("data:"):
        return url.split(",", 1)[1]
    req = Request(url, headers={"User-Agent": "pytest/1.0"})
    data = urlopen(req, timeout=15).read()
    im = Image.open(io.BytesIO(data)).convert("RGB")
    im.thumbnail((640, 640))
    buf = io.BytesIO()
    im.save(buf, format="JPEG", quality=80)
    return base64.b64encode(buf.getvalue()).decode()


@pytest.fixture(scope="session")
def blank_image_b64() -> str:
    """A plain grey 320x320 image with no face."""
    im = Image.new("RGB", (320, 320), color=(120, 120, 120))
    buf = io.BytesIO()
    im.save(buf, format="JPEG", quality=80)
    return base64.b64encode(buf.getvalue()).decode()


# ---------- enroll-face endpoint ----------
class TestEnrollFace:
    def test_requires_bearer(self, ramesh_id):
        r = requests.post(
            f"{BASE_URL}/employees/{ramesh_id}/enroll-face",
            json={"image_b64": "x", "update_photo": False},
            timeout=30,
        )
        assert r.status_code == 401, r.text

    def test_no_face_returns_422(self, headers, ramesh_id, blank_image_b64):
        r = requests.post(
            f"{BASE_URL}/employees/{ramesh_id}/enroll-face",
            headers=headers,
            json={"image_b64": blank_image_b64, "update_photo": False},
            timeout=30,
        )
        assert r.status_code == 422, r.text
        # helpful error message expected
        assert "face" in r.text.lower()

    def test_enroll_then_persist(self, headers, ramesh_id, ramesh_face_b64):
        r = requests.post(
            f"{BASE_URL}/employees/{ramesh_id}/enroll-face",
            headers=headers,
            json={"image_b64": ramesh_face_b64, "update_photo": False},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["ok"] is True
        assert body["employee"]["id"] == ramesh_id
        assert body["employee"]["code"] == "DHD-1042"

        # verify persistence in DB
        with SessionLocal() as db:
            emp = db.get(Employee, ramesh_id)
            assert emp.face_encoding, "face_encoding not persisted"


# ---------- attendance match endpoint ----------
class TestMatchFace:
    def test_requires_bearer(self):
        r = requests.post(
            f"{BASE_URL}/attendance/match",
            json={"image_b64": "x", "type": "Check-in", "threshold": 0.6},
            timeout=30,
        )
        assert r.status_code == 401, r.text

    def test_invalid_base64_returns_400(self, headers):
        r = requests.post(
            f"{BASE_URL}/attendance/match",
            headers=headers,
            json={"image_b64": "!!!not-a-valid-b64!!!", "type": "Check-in"},
            timeout=15,
        )
        assert r.status_code == 400, r.text

    def test_match_after_enroll(self, headers, ramesh_face_b64):
        """After enrolling DHD-1042 with a photo, matching same photo returns matched=true."""
        r = requests.post(
            f"{BASE_URL}/attendance/match",
            headers=headers,
            json={
                "image_b64": ramesh_face_b64,
                "type": "Check-in",
                "threshold": 0.6,
            },
            timeout=60,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["matched"] is True, body
        assert body["distance"] is not None
        assert body["distance"] < 0.6
        # distance should be ~0 since we enrolled with the same image
        assert body["distance"] < 0.05, f"distance {body['distance']} not near 0"
        assert body["employee"]["code"] == "DHD-1042"
        assert body["attendance"] is not None
        assert body["attendance"]["type"] == "Check-in"

    def test_match_creates_attendance_record(self, headers, ramesh_face_b64):
        # Fetch today's attendance BEFORE
        before = requests.get(
            f"{BASE_URL}/attendance/today", headers=headers, timeout=15
        )
        assert before.status_code == 200
        before_count = len(before.json())

        r = requests.post(
            f"{BASE_URL}/attendance/match",
            headers=headers,
            json={
                "image_b64": ramesh_face_b64,
                "type": "Check-out",
                "threshold": 0.6,
            },
            timeout=60,
        )
        assert r.status_code == 200, r.text
        assert r.json()["matched"] is True

        after = requests.get(
            f"{BASE_URL}/attendance/today", headers=headers, timeout=15
        )
        assert after.status_code == 200
        assert len(after.json()) >= before_count + 1
        # newest record should be for DHD-1042 Check-out
        top = after.json()[0]
        assert top["employee_code"] == "DHD-1042"
        assert top["type"] == "Check-out"
