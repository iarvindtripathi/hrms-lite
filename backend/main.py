from datetime import date
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from . import models
from .database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS Lite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1)
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    department: str = Field(..., min_length=1)


class EmployeeOut(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

    class Config:
        from_attributes = True


class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: str = Field(..., pattern="^(Present|Absent)$")


class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    date: date
    status: str

    class Config:
        from_attributes = True


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/employees", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    existing_by_emp_id = db.query(models.Employee).filter(models.Employee.employee_id == payload.employee_id).first()
    if existing_by_emp_id:
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    existing_by_email = db.query(models.Employee).filter(models.Employee.email == payload.email).first()
    if existing_by_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    employee = models.Employee(
        employee_id=payload.employee_id,
        full_name=payload.full_name,
        email=str(payload.email),
        department=payload.department,
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@app.get("/employees", response_model=List[EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).order_by(models.Employee.id.desc()).all()


@app.delete("/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(employee)
    db.commit()
    return


@app.post("/attendance", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == payload.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.employee_id == payload.employee_id,
            models.Attendance.date == payload.date,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already marked for this date")

    attendance = models.Attendance(
        employee_id=payload.employee_id,
        date=payload.date,
        status=payload.status,
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


@app.get("/employees/{employee_id}/attendance", response_model=List[AttendanceOut])
def get_employee_attendance(
    employee_id: int, start_date: Optional[date] = None, end_date: Optional[date] = None, db: Session = Depends(get_db)
):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    query = db.query(models.Attendance).filter(models.Attendance.employee_id == employee_id)
    if start_date:
        query = query.filter(models.Attendance.date >= start_date)
    if end_date:
        query = query.filter(models.Attendance.date <= end_date)
    return query.order_by(models.Attendance.date.desc()).all()





