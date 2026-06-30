from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import Store
from backend.schemas import StoreCreate, StoreResponse

router = APIRouter()

@router.get("/", response_model=list[StoreResponse])
async def list_stores(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Store))
    return result.scalars().all()

@router.post("/", response_model=StoreResponse, status_code=201)
async def create_store(payload: StoreCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Store).where(Store.store_id == payload.store_id))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Store ID already exists.")
    s = Store(**payload.model_dump())
    db.add(s); await db.commit(); await db.refresh(s)
    return s

@router.put("/{sid}", response_model=StoreResponse)
async def update_store(sid: int, payload: StoreCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Store).where(Store.id == sid))
    s = result.scalar_one_or_none()
    if not s: raise HTTPException(404, "Store not found")
    for k, v in payload.model_dump().items(): setattr(s, k, v)
    await db.commit(); await db.refresh(s)
    return s

@router.delete("/{sid}")
async def delete_store(sid: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Store).where(Store.id == sid))
    s = result.scalar_one_or_none()
    if not s: raise HTTPException(404, "Store not found")
    await db.delete(s); await db.commit()
    return {"ok": True}
