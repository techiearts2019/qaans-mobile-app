"""
Dihadi FastAPI backend — MySQL (via SQLAlchemy + PyMySQL)

All endpoints are namespaced under /api.
Auth is intentionally OFF for the demo phase.
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Optional
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Query
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    create_engine,
    select,
)
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, Session, relationship, sessionmaker
from starlette.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------- config ----
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MYSQL_URL = URL.create(
    drivername="mysql+pymysql",
    username=os.environ["MYSQL_USER"],
    password=os.environ["MYSQL_PASSWORD"],
    host=os.environ["MYSQL_HOST"],
    port=int(os.environ["MYSQL_PORT"]),
    database=os.environ["MYSQL_DB"],
    query={"charset": "utf8mb4"},
)

engine = create_engine(
    MYSQL_URL,
    pool_pre_ping=True,
    pool_recycle=280,
    pool_size=5,
    max_overflow=10,
    echo=False,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def new_id() -> str:
    return uuid4().hex


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


# --------------------------------------------------------------- models -----
class Base(DeclarativeBase):
    pass


class Supervisor(Base):
    __tablename__ = "supervisors"
    id = Column(String(64), primary_key=True, default=new_id)
    name = Column(String(120), nullable=False)
    code = Column(String(40), unique=True, nullable=False)
    email = Column(String(180))
    phone = Column(String(40))
    designation = Column(String(120))
    photo = Column(Text)
    joining_date = Column(String(40))
    created_at = Column(DateTime, default=now_utc)


class Project(Base):
    __tablename__ = "projects"
    id = Column(String(64), primary_key=True, default=new_id)
    name = Column(String(180), nullable=False)
    location = Column(String(180))
    start_date = Column(String(40))
    status = Column(String(20), default="Active", nullable=False)  # Active/Completed/On Hold
    cover = Column(Text)
    created_at = Column(DateTime, default=now_utc)

    allocations = relationship(
        "Allocation", back_populates="project", cascade="all, delete-orphan"
    )


class Employee(Base):
    __tablename__ = "employees"
    id = Column(String(64), primary_key=True, default=new_id)
    name = Column(String(120), nullable=False)
    name_hi = Column(String(120))
    code = Column(String(40), unique=True, nullable=False)
    designation = Column(String(120))
    skill = Column(String(120))
    gender = Column(String(20))
    marital_status = Column(String(20))
    dob = Column(String(40))
    father_name = Column(String(120))
    nominee = Column(String(120))
    primary_mobile = Column(String(40))
    alt_mobile = Column(String(40))
    email = Column(String(180))
    date_of_joining = Column(String(40))
    date_of_exit = Column(String(40))
    current_address = Column(Text)
    permanent_address = Column(Text)
    aadhaar = Column(String(40))
    pan = Column(String(40))
    uan = Column(String(40))
    esi = Column(String(40))
    status = Column(String(30), default="Active")  # Active/Inactive/No Allocation
    photo = Column(Text)
    created_at = Column(DateTime, default=now_utc)

    allocations = relationship(
        "Allocation", back_populates="employee", cascade="all, delete-orphan"
    )


class Allocation(Base):
    __tablename__ = "allocations"
    id = Column(String(64), primary_key=True, default=new_id)
    project_id = Column(String(64), ForeignKey("projects.id"), nullable=False)
    employee_id = Column(String(64), ForeignKey("employees.id"), nullable=False)
    allocated_at = Column(DateTime, default=now_utc)
    __table_args__ = (UniqueConstraint("project_id", "employee_id", name="uq_alloc"),)

    project = relationship("Project", back_populates="allocations")
    employee = relationship("Employee", back_populates="allocations")


class AttendanceRecord(Base):
    __tablename__ = "attendance"
    id = Column(String(64), primary_key=True, default=new_id)
    employee_id = Column(String(64), ForeignKey("employees.id"), nullable=False)
    type = Column(String(20), nullable=False)  # Check-in / Check-out
    time = Column(String(40))  # display string "08:42 AM"
    status = Column(String(20))  # On Time / Late / Early Out
    marked_at = Column(DateTime, default=now_utc)
    day = Column(Date, default=lambda: date.today())


class SalaryRecord(Base):
    __tablename__ = "salary_records"
    id = Column(String(64), primary_key=True, default=new_id)
    employee_id = Column(String(64), ForeignKey("employees.id"), nullable=False)
    month = Column(String(20), nullable=False)  # "Feb 26"
    days_worked = Column(Integer, default=0)
    daily_rate = Column(Integer, default=0)
    deductions = Column(Integer, default=0)
    status = Column(String(20), default="Pending")  # Paid / Pending / Processing


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String(64), primary_key=True, default=new_id)
    title = Column(String(180), nullable=False)
    description = Column(Text)
    time_label = Column(String(60))
    read = Column(Integer, default=0)
    type = Column(String(30))  # attendance / employee / salary / system
    created_at = Column(DateTime, default=now_utc)


# --------------------------------------------------------------- schemas ----
class PydBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class SupervisorOut(PydBase):
    id: str
    name: str
    code: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    photo: Optional[str] = None
    joining_date: Optional[str] = None


class ProjectOut(PydBase):
    id: str
    name: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    status: str
    cover: Optional[str] = None
    allocated_employee_ids: list[str] = []


class ProjectIn(BaseModel):
    name: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    status: str = "Active"
    cover: Optional[str] = None


class EmployeeOut(PydBase):
    id: str
    name: str
    name_hi: Optional[str] = None
    code: str
    designation: Optional[str] = None
    skill: Optional[str] = None
    status: str
    photo: Optional[str] = None
    primary_mobile: Optional[str] = None
    email: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None


class EmployeeIn(BaseModel):
    name: str
    name_hi: Optional[str] = None
    code: str
    designation: Optional[str] = None
    skill: Optional[str] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    dob: Optional[str] = None
    father_name: Optional[str] = None
    nominee: Optional[str] = None
    primary_mobile: Optional[str] = None
    alt_mobile: Optional[str] = None
    email: Optional[str] = None
    date_of_joining: Optional[str] = None
    date_of_exit: Optional[str] = None
    current_address: Optional[str] = None
    permanent_address: Optional[str] = None
    aadhaar: Optional[str] = None
    pan: Optional[str] = None
    uan: Optional[str] = None
    esi: Optional[str] = None
    status: str = "Active"
    photo: Optional[str] = None
    project_id: Optional[str] = None


class AttendanceOut(PydBase):
    id: str
    employee_id: str
    employee_name: str
    employee_code: str
    photo: Optional[str] = None
    type: str
    time: Optional[str] = None
    status: Optional[str] = None


class AttendanceIn(BaseModel):
    employee_id: str
    type: str = Field(pattern="^(Check-in|Check-out)$")
    time: Optional[str] = None
    status: Optional[str] = "On Time"


class SalaryOut(PydBase):
    id: str
    employee_id: str
    employee_name: str
    employee_code: str
    photo: Optional[str] = None
    month: str
    days_worked: int
    daily_rate: int
    deductions: int
    status: str
    net: int


class NotificationOut(PydBase):
    id: str
    title: str
    description: Optional[str] = None
    time_label: Optional[str] = None
    read: bool
    type: str


# --------------------------------------------------------- seed on startup --
SEED_SUPERVISOR = dict(
    name="Rajesh Verma",
    code="SUP-0007",
    email="rajesh.verma@dihadi.in",
    phone="+91 99999 88888",
    designation="Senior Supervisor",
    joining_date="12 Jan 2022",
    photo="https://images.unsplash.com/photo-1679679811837-c28b2586f533?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHx3b3JrZXIlMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODI1NTEzODB8MA&ixlib=rb-4.1.0&q=85",
)

SEED_EMPLOYEES = [
    dict(id="e1", name="Ramesh Kumar", name_hi="रमेश कुमार", code="DHD-1042",
         designation="Site Supervisor", skill="Supervision", status="Active",
         primary_mobile="+91 98231 45678", email="ramesh.k@dihadi.in",
         photo="https://images.unsplash.com/photo-1646227655685-a530813759b3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwzfHx3b3JrZXIlMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODI1NTEzODB8MA&ixlib=rb-4.1.0&q=85"),
    dict(id="e2", name="Sunita Devi", name_hi="सुनीता देवी", code="DHD-1043",
         designation="Helper", skill="General Labour", status="Active",
         primary_mobile="+91 98112 33445",
         photo="https://images.pexels.com/photos/12576220/pexels-photo-12576220.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"),
    dict(id="e3", name="Mohan Singh", name_hi="मोहन सिंह", code="DHD-1044",
         designation="Mason", skill="Bricklaying", status="No Allocation",
         primary_mobile="+91 97650 12000",
         photo="https://images.pexels.com/photos/9227535/pexels-photo-9227535.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"),
    dict(id="e4", name="Anil Yadav", name_hi="अनिल यादव", code="DHD-1045",
         designation="Electrician", skill="Wiring", status="Inactive",
         primary_mobile="+91 96007 23498",
         photo="https://images.unsplash.com/photo-1679679811837-c28b2586f533?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHx3b3JrZXIlMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODI1NTEzODB8MA&ixlib=rb-4.1.0&q=85"),
    dict(id="e5", name="Priya Sharma", name_hi="प्रिया शर्मा", code="DHD-1046",
         designation="Office Assistant", skill="Supervision", status="Active",
         primary_mobile="+91 95002 78122", email="priya.s@dihadi.in",
         photo="https://images.pexels.com/photos/37556467/pexels-photo-37556467.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"),
]

SEED_PROJECTS = [
    dict(id="p1", name="Skyline Tower A", location="Sector 62, Noida",
         start_date="12 Jan 2026", status="Active",
         cover="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=60",
         allocations=["e1", "e2", "e5"]),
    dict(id="p2", name="Greenfield Mall Renovation", location="MG Road, Gurgaon",
         start_date="03 Nov 2025", status="Active",
         cover="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=60",
         allocations=["e4"]),
    dict(id="p3", name="Riverside Villas Phase 2", location="Yamuna Expressway",
         start_date="20 Aug 2025", status="On Hold",
         cover="https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=900&q=60",
         allocations=[]),
    dict(id="p4", name="Metro Line Extension", location="Dwarka, Delhi",
         start_date="05 Feb 2025", status="Completed",
         cover="https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=900&q=60",
         allocations=[]),
]

SEED_ATTENDANCE = [
    ("e1", "Check-in", "08:42 AM", "On Time"),
    ("e2", "Check-in", "09:05 AM", "Late"),
    ("e5", "Check-in", "08:55 AM", "On Time"),
]

SEED_SALARY = [
    ("e1", "Feb 26", 26, 750, 200, "Paid"),
    ("e2", "Feb 26", 24, 550, 100, "Paid"),
    ("e3", "Feb 26", 22, 700, 0, "Pending"),
    ("e4", "Feb 26", 18, 800, 300, "Processing"),
    ("e5", "Feb 26", 26, 600, 150, "Paid"),
]

SEED_NOTIFICATIONS = [
    ("Attendance marked", "Ramesh Kumar checked in at 08:42 AM", "10 mins ago", False, "attendance"),
    ("New employee added", "Priya Sharma (DHD-1046) has been added to your team", "1 hour ago", False, "employee"),
    ("Salary processed", "December salary cycle completed for 48 employees", "Yesterday", True, "salary"),
    ("Attendance marked", "Sunita Devi checked in at 09:05 AM (Late)", "Yesterday", True, "attendance"),
    ("Employee records updated", "Mohan Singh's allocation has been updated", "2 days ago", True, "employee"),
]


def seed_if_empty() -> None:
    with SessionLocal() as db:
        if db.query(Supervisor).count() == 0:
            db.add(Supervisor(**SEED_SUPERVISOR))
        if db.query(Employee).count() == 0:
            for e in SEED_EMPLOYEES:
                db.add(Employee(**e))
        if db.query(Project).count() == 0:
            allocs: list[tuple[str, str]] = []
            for p in SEED_PROJECTS:
                emps = p.pop("allocations")
                db.add(Project(**p))
                for eid in emps:
                    allocs.append((p["id"], eid))
            db.flush()
            for pid, eid in allocs:
                db.add(Allocation(project_id=pid, employee_id=eid))
        if db.query(AttendanceRecord).count() == 0:
            for eid, t, tm, st in SEED_ATTENDANCE:
                db.add(AttendanceRecord(employee_id=eid, type=t, time=tm, status=st))
        if db.query(SalaryRecord).count() == 0:
            for eid, m, dw, rate, ded, st in SEED_SALARY:
                db.add(SalaryRecord(employee_id=eid, month=m, days_worked=dw,
                                    daily_rate=rate, deductions=ded, status=st))
        if db.query(Notification).count() == 0:
            for title, desc, tl, r, tp in SEED_NOTIFICATIONS:
                db.add(Notification(title=title, description=desc, time_label=tl,
                                    read=1 if r else 0, type=tp))
        db.commit()


# --------------------------------------------------------- app / lifespan --
@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_if_empty()
    yield


app = FastAPI(lifespan=lifespan)
api = APIRouter(prefix="/api")


# ---------------------------------------------------- helper serializers ---
def employee_to_out(emp: Employee, db: Session) -> EmployeeOut:
    alloc = (
        db.execute(select(Allocation).where(Allocation.employee_id == emp.id))
        .scalars()
        .first()
    )
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    if alloc:
        project_id = alloc.project_id
        proj = db.get(Project, alloc.project_id)
        project_name = proj.name if proj else None
    return EmployeeOut(
        id=emp.id, name=emp.name, name_hi=emp.name_hi, code=emp.code,
        designation=emp.designation, skill=emp.skill, status=emp.status,
        photo=emp.photo, primary_mobile=emp.primary_mobile, email=emp.email,
        project_id=project_id, project_name=project_name,
    )


def project_to_out(p: Project) -> ProjectOut:
    return ProjectOut(
        id=p.id, name=p.name, location=p.location, start_date=p.start_date,
        status=p.status, cover=p.cover,
        allocated_employee_ids=[a.employee_id for a in p.allocations],
    )


# ------------------------------------------------------------- endpoints ---
@api.get("/")
def root():
    return {"service": "dihadi", "status": "ok", "time": now_utc().isoformat()}


@api.get("/supervisor/me", response_model=SupervisorOut)
def get_supervisor():
    with SessionLocal() as db:
        sup = db.query(Supervisor).first()
        if not sup:
            raise HTTPException(404, "No supervisor")
        return SupervisorOut.model_validate(sup)


# ---- employees ----
@api.get("/employees", response_model=list[EmployeeOut])
def list_employees(status: Optional[str] = None, q: Optional[str] = None):
    with SessionLocal() as db:
        query = db.query(Employee)
        if status and status != "All":
            query = query.filter(Employee.status == status)
        if q:
            like = f"%{q}%"
            query = query.filter((Employee.name.ilike(like)) | (Employee.code.ilike(like)))
        emps = query.order_by(Employee.created_at.desc()).all()
        return [employee_to_out(e, db) for e in emps]


@api.post("/employees", response_model=EmployeeOut)
def create_employee(payload: EmployeeIn):
    with SessionLocal() as db:
        data = payload.model_dump(exclude={"project_id"})
        emp = Employee(**data)
        db.add(emp)
        db.flush()
        if payload.project_id:
            db.add(Allocation(project_id=payload.project_id, employee_id=emp.id))
        db.commit()
        db.refresh(emp)
        return employee_to_out(emp, db)


@api.get("/employees/{emp_id}", response_model=EmployeeOut)
def get_employee(emp_id: str):
    with SessionLocal() as db:
        emp = db.get(Employee, emp_id)
        if not emp:
            raise HTTPException(404, "Employee not found")
        return employee_to_out(emp, db)


@api.delete("/employees/{emp_id}")
def delete_employee(emp_id: str):
    with SessionLocal() as db:
        emp = db.get(Employee, emp_id)
        if not emp:
            raise HTTPException(404, "Employee not found")
        db.delete(emp)
        db.commit()
        return {"ok": True}


# ---- projects ----
@api.get("/projects", response_model=list[ProjectOut])
def list_projects(status: Optional[str] = None, q: Optional[str] = None):
    with SessionLocal() as db:
        query = db.query(Project)
        if status and status != "All":
            query = query.filter(Project.status == status)
        if q:
            like = f"%{q}%"
            query = query.filter((Project.name.ilike(like)) | (Project.location.ilike(like)))
        projs = query.order_by(Project.created_at.desc()).all()
        return [project_to_out(p) for p in projs]


@api.post("/projects", response_model=ProjectOut)
def create_project(payload: ProjectIn):
    with SessionLocal() as db:
        p = Project(**payload.model_dump())
        db.add(p)
        db.commit()
        db.refresh(p)
        return project_to_out(p)


@api.get("/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: str):
    with SessionLocal() as db:
        p = db.get(Project, project_id)
        if not p:
            raise HTTPException(404, "Project not found")
        return project_to_out(p)


@api.post("/projects/{project_id}/allocate/{employee_id}", response_model=ProjectOut)
def allocate_employee(project_id: str, employee_id: str):
    with SessionLocal() as db:
        if not db.get(Project, project_id):
            raise HTTPException(404, "Project not found")
        if not db.get(Employee, employee_id):
            raise HTTPException(404, "Employee not found")
        exists = (
            db.execute(
                select(Allocation).where(
                    (Allocation.project_id == project_id)
                    & (Allocation.employee_id == employee_id)
                )
            )
            .scalars()
            .first()
        )
        if not exists:
            db.add(Allocation(project_id=project_id, employee_id=employee_id))
            db.commit()
        p = db.get(Project, project_id)
        return project_to_out(p)


@api.delete("/projects/{project_id}/allocate/{employee_id}", response_model=ProjectOut)
def unallocate_employee(project_id: str, employee_id: str):
    with SessionLocal() as db:
        alloc = (
            db.execute(
                select(Allocation).where(
                    (Allocation.project_id == project_id)
                    & (Allocation.employee_id == employee_id)
                )
            )
            .scalars()
            .first()
        )
        if alloc:
            db.delete(alloc)
            db.commit()
        p = db.get(Project, project_id)
        if not p:
            raise HTTPException(404, "Project not found")
        return project_to_out(p)


# ---- attendance ----
@api.get("/attendance/today", response_model=list[AttendanceOut])
def today_attendance():
    with SessionLocal() as db:
        recs = db.query(AttendanceRecord).filter(AttendanceRecord.day == date.today()).all()
        out: list[AttendanceOut] = []
        for r in recs:
            emp = db.get(Employee, r.employee_id)
            if not emp:
                continue
            out.append(
                AttendanceOut(
                    id=r.id, employee_id=emp.id, employee_name=emp.name,
                    employee_code=emp.code, photo=emp.photo,
                    type=r.type, time=r.time, status=r.status,
                )
            )
        return out


@api.post("/attendance/mark", response_model=AttendanceOut)
def mark_attendance(payload: AttendanceIn):
    with SessionLocal() as db:
        emp = db.get(Employee, payload.employee_id)
        if not emp:
            raise HTTPException(404, "Employee not found")
        rec = AttendanceRecord(
            employee_id=emp.id,
            type=payload.type,
            time=payload.time or datetime.now().strftime("%I:%M %p"),
            status=payload.status,
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)
        return AttendanceOut(
            id=rec.id, employee_id=emp.id, employee_name=emp.name,
            employee_code=emp.code, photo=emp.photo,
            type=rec.type, time=rec.time, status=rec.status,
        )


# ---- salary ----
@api.get("/salary", response_model=list[SalaryOut])
def salary_records(month: Optional[str] = Query(default=None)):
    with SessionLocal() as db:
        query = db.query(SalaryRecord)
        if month:
            query = query.filter(SalaryRecord.month == month)
        rows = query.all()
        out: list[SalaryOut] = []
        for r in rows:
            emp = db.get(Employee, r.employee_id)
            if not emp:
                continue
            net = r.days_worked * r.daily_rate - r.deductions
            out.append(
                SalaryOut(
                    id=r.id, employee_id=emp.id, employee_name=emp.name,
                    employee_code=emp.code, photo=emp.photo, month=r.month,
                    days_worked=r.days_worked, daily_rate=r.daily_rate,
                    deductions=r.deductions, status=r.status, net=net,
                )
            )
        return out


# ---- notifications ----
@api.get("/notifications", response_model=list[NotificationOut])
def list_notifications():
    with SessionLocal() as db:
        rows = db.query(Notification).order_by(Notification.created_at.desc()).all()
        return [
            NotificationOut(
                id=n.id, title=n.title, description=n.description,
                time_label=n.time_label, read=bool(n.read), type=n.type,
            )
            for n in rows
        ]


@api.patch("/notifications/{nid}/read")
def mark_notification_read(nid: str):
    with SessionLocal() as db:
        n = db.get(Notification, nid)
        if not n:
            raise HTTPException(404, "Notification not found")
        n.read = 1
        db.commit()
        return {"ok": True}


@api.post("/notifications/read-all")
def mark_all_read():
    with SessionLocal() as db:
        db.query(Notification).update({Notification.read: 1})
        db.commit()
        return {"ok": True}


# --------------------------------------------------------- app wiring ------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("dihadi")
