from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.database import get_db
from backend.models import Inventory
from backend.schemas import InventoryCreate, InventoryResponse

router = APIRouter()

@router.get("/", response_model=list[InventoryResponse])
async def list_inventory(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Inventory))
    return result.scalars().all()

@router.post("/", response_model=InventoryResponse, status_code=201)
async def create_inventory(payload: InventoryCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Inventory).where(Inventory.item_code == payload.item_code))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Item code already exists.")
    inv = Inventory(**payload.model_dump())
    db.add(inv); await db.commit(); await db.refresh(inv)
    return inv

@router.put("/{iid}", response_model=InventoryResponse)
async def update_inventory(iid: int, payload: InventoryCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Inventory).where(Inventory.id == iid))
    inv = result.scalar_one_or_none()
    if not inv: raise HTTPException(404, "Item not found")
    for k, v in payload.model_dump().items(): setattr(inv, k, v)
    await db.commit(); await db.refresh(inv)
    return inv

@router.delete("/{iid}")
async def delete_inventory(iid: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Inventory).where(Inventory.id == iid))
    inv = result.scalar_one_or_none()
    if not inv: raise HTTPException(404, "Item not found")
    await db.delete(inv); await db.commit()
    return {"ok": True}
