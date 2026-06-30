import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.models import Employee
from backend.schemas import EmployeeCreate, EmployeeResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=list[EmployeeResponse])
async def list_employees(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).order_by(Employee.joined_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=EmployeeResponse, status_code=201)
async def create_employee(payload: EmployeeCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Employee).where(Employee.emp_id == payload.emp_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Employee ID already exists.")
    emp = Employee(**payload.model_dump())
    db.add(emp)
    await db.commit()
    await db.refresh(emp)
    return emp


@router.put("/{emp_id_}", response_model=EmployeeResponse)
async def update_employee(emp_id_: int, payload: EmployeeCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.id == emp_id_))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    for k, v in payload.model_dump().items():
        setattr(emp, k, v)
    await db.commit()
    await db.refresh(emp)
    return emp


@router.delete("/{emp_id_}")
async def delete_employee(emp_id_: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Employee).where(Employee.id == emp_id_))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    await db.delete(emp)
    await db.commit()
    return {"ok": True}
