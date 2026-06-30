from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import Supplier
from backend.schemas import SupplierCreate, SupplierResponse

router = APIRouter()

@router.get("/", response_model=list[SupplierResponse])
async def list_suppliers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier))
    return result.scalars().all()

@router.post("/", response_model=SupplierResponse, status_code=201)
async def create_supplier(payload: SupplierCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Supplier).where(Supplier.supplier_id == payload.supplier_id))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Supplier ID already exists.")
    s = Supplier(**payload.model_dump())
    db.add(s); await db.commit(); await db.refresh(s)
    return s

@router.put("/{sid}", response_model=SupplierResponse)
async def update_supplier(sid: int, payload: SupplierCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).where(Supplier.id == sid))
    s = result.scalar_one_or_none()
    if not s: raise HTTPException(404, "Supplier not found")
    for k, v in payload.model_dump().items(): setattr(s, k, v)
    await db.commit(); await db.refresh(s)
    return s

@router.delete("/{sid}")
async def delete_supplier(sid: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).where(Supplier.id == sid))
    s = result.scalar_one_or_none()
    if not s: raise HTTPException(404, "Supplier not found")
    await db.delete(s); await db.commit()
    return {"ok": True}
