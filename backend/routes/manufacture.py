from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import Manufacture
from backend.schemas import ManufactureCreate, ManufactureResponse

router = APIRouter()

@router.get("/", response_model=list[ManufactureResponse])
async def list_manufacture(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Manufacture).order_by(Manufacture.start_date.desc()))
    return result.scalars().all()

@router.post("/", response_model=ManufactureResponse, status_code=201)
async def create_manufacture(payload: ManufactureCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Manufacture).where(Manufacture.order_id == payload.order_id))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Order ID already exists.")
    data = payload.model_dump()
    m = Manufacture(**data)
    db.add(m); await db.commit(); await db.refresh(m)
    return m

@router.put("/{mid}", response_model=ManufactureResponse)
async def update_manufacture(mid: int, payload: ManufactureCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Manufacture).where(Manufacture.id == mid))
    m = result.scalar_one_or_none()
    if not m: raise HTTPException(404, "Order not found")
    for k, v in payload.model_dump().items(): setattr(m, k, v)
    await db.commit(); await db.refresh(m)
    return m

@router.delete("/{mid}")
async def delete_manufacture(mid: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Manufacture).where(Manufacture.id == mid))
    m = result.scalar_one_or_none()
    if not m: raise HTTPException(404, "Order not found")
    await db.delete(m); await db.commit()
    return {"ok": True}
