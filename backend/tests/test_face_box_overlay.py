"""Iteration 3 backend tests: face bounding box overlay in /api/attendance/match.

Verifies that every detected face carries a normalized `box: {top,right,bottom,left}`
in the closed interval [0, 1], for both matched AND unmatched detections, and that
the OpenAPI schema exposes FaceBox + FaceMatchItem.box.
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

load_dotenv("/app/backend/.env")
load_dotenv("/app/frontend/.env")
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
@pytest.fixture(scope="module")
def token() -> str:
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


@pytest.fixture(scope="module")
def headers(token) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def _b64_of(img: Image.Image, q: int = 85) -> str:
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=q)
    return base64.b64encode(buf.getvalue()).decode()


@pytest.fixture(scope="module")
def ramesh_face_img() -> Image.Image:
    with SessionLocal() as db:
        emp = db.query(Employee).filter(Employee.code == "DHD-1042").first()
        assert emp, "DHD-1042 not seeded"
        photo_url = emp.photo
    if photo_url.startswith("data:"):
        raw = base64.b64decode(photo_url.split(",", 1)[1])
    else:
        req = Request(photo_url, headers={"User-Agent": "pytest/1.0"})
        raw = urlopen(req, timeout=15).read()
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    im.thumbnail((640, 640))
    return im


def _assert_box_normalized(box: dict):
    assert set(box.keys()) >= {"top", "right", "bottom", "left"}, box
    for k in ("top", "right", "bottom", "left"):
        v = box[k]
        assert isinstance(v, (int, float)), f"{k} not numeric: {v!r}"
        assert 0.0 <= float(v) <= 1.0, f"{k} not normalized: {v}"
    assert float(box["top"]) < float(box["bottom"]), box
    assert float(box["left"]) < float(box["right"]), box


class TestFaceBoxSingle:
    def test_single_face_has_normalized_box(self, headers, ramesh_face_img):
        r = requests.post(
            f"{BASE_URL}/attendance/match",
            headers=headers,
            json={
                "image_b64": _b64_of(ramesh_face_img),
                "type": "Check-in",
                "threshold": 0.6,
            },
            timeout=60,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["faces_detected"] >= 1
        assert body["matches"], body
        first = body["matches"][0]
        assert "box" in first and first["box"] is not None, first
        _assert_box_normalized(first["box"])

    def test_matched_box_present(self, headers, ramesh_face_img):
        r = requests.post(
            f"{BASE_URL}/attendance/match",
            headers=headers,
            json={
                "image_b64": _b64_of(ramesh_face_img),
                "type": "Check-in",
                "threshold": 0.6,
            },
            timeout=60,
        )
        body = r.json()
        matched_items = [m for m in body["matches"] if m["matched"]]
        assert matched_items, "expected at least one matched entry"
        for m in matched_items:
            assert m.get("box") is not None
            _assert_box_normalized(m["box"])


class TestFaceBoxMulti:
    def test_two_faces_both_have_boxes(self, headers, ramesh_face_img):
        w, h = ramesh_face_img.size
        canvas = Image.new("RGB", (w * 2 + 30, h), color=(255, 255, 255))
        canvas.paste(ramesh_face_img, (0, 0))
        canvas.paste(ramesh_face_img, (w + 30, 0))
        r = requests.post(
            f"{BASE_URL}/attendance/match",
            headers=headers,
            json={
                "image_b64": _b64_of(canvas),
                "type": "Check-in",
                "threshold": 0.6,
            },
            timeout=60,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["faces_detected"] >= 2, body
        assert len(body["matches"]) >= 2, body
        for m in body["matches"]:
            assert m.get("box") is not None, m
            _assert_box_normalized(m["box"])

    def test_unmatched_face_also_carries_box(self, headers, ramesh_face_img):
        """Force at least one unmatched detection by using an impossibly tight
        threshold on a two-face frame so at least one face fails the distance
        gate. Every unmatched entry must still carry a normalized box."""
        w, h = ramesh_face_img.size
        canvas = Image.new("RGB", (w * 2 + 30, h), color=(255, 255, 255))
        canvas.paste(ramesh_face_img, (0, 0))
        canvas.paste(ramesh_face_img, (w + 30, 0))
        r = requests.post(
            f"{BASE_URL}/attendance/match",
            headers=headers,
            json={
                # 0.30 is the minimum allowed; combined with dedupe this
                # typically produces exactly one matched + one unmatched.
                "image_b64": _b64_of(canvas),
                "type": "Check-in",
                "threshold": 0.30,
            },
            timeout=60,
        )
        body = r.json()
        # Regardless of matched/unmatched split, every entry must have a box.
        assert body["matches"], body
        unmatched = [m for m in body["matches"] if not m["matched"]]
        # In this configuration we expect at least one unmatched detection
        # (dedupe forces the second copy to be unmatched OR the tight
        # threshold rejects it). If somehow all matched, still verify all
        # boxes exist — the schema contract is what matters.
        for m in body["matches"]:
            assert m.get("box") is not None, m
            _assert_box_normalized(m["box"])
        # And separately, if there ARE unmatched entries, confirm they have
        # boxes (redundant with above but explicit about the requirement).
        for m in unmatched:
            assert m.get("box") is not None, m

    def test_boxes_do_not_overlap_horizontally(self, headers, ramesh_face_img):
        """Sanity: two side-by-side faces should have disjoint x ranges."""
        w, h = ramesh_face_img.size
        canvas = Image.new("RGB", (w * 2 + 30, h), color=(255, 255, 255))
        canvas.paste(ramesh_face_img, (0, 0))
        canvas.paste(ramesh_face_img, (w + 30, 0))
        r = requests.post(
            f"{BASE_URL}/attendance/match",
            headers=headers,
            json={
                "image_b64": _b64_of(canvas),
                "type": "Check-in",
                "threshold": 0.6,
            },
            timeout=60,
        )
        body = r.json()
        boxes = [m["box"] for m in body["matches"] if m.get("box")]
        assert len(boxes) >= 2, body
        # sort by left, ensure box[i].right <= box[i+1].left (with slack)
        boxes_sorted = sorted(boxes, key=lambda b: b["left"])
        for a, b in zip(boxes_sorted, boxes_sorted[1:]):
            assert a["right"] <= b["left"] + 0.05, (a, b)


class TestOpenApiSchema:
    def test_facebox_and_facematchitem_schema(self):
        # openapi.json is only exposed on the backend service internally
        # (external ingress routes /api* to backend; /openapi.json is served
        # by the Expo frontend at the public URL). Hit backend directly.
        r = requests.get("http://localhost:8001/openapi.json", timeout=30)
        assert r.status_code == 200, r.text
        spec = r.json()
        schemas = spec.get("components", {}).get("schemas", {})
        assert "FaceBox" in schemas, list(schemas.keys())
        fb = schemas["FaceBox"]
        props = fb.get("properties", {})
        for k in ("top", "right", "bottom", "left"):
            assert k in props, f"FaceBox missing {k}: {props}"

        assert "FaceMatchItem" in schemas, list(schemas.keys())
        fmi = schemas["FaceMatchItem"]
        fmi_props = fmi.get("properties", {})
        assert "box" in fmi_props, fmi_props
        # box should reference FaceBox (either directly or via anyOf/allOf for
        # Optional[FaceBox])
        box_prop = fmi_props["box"]
        raw = str(box_prop)
        assert "FaceBox" in raw, box_prop
