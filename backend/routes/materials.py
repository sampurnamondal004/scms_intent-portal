import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text

from backend.database import get_db
from backend.models import Material, User
from backend.schemas import MaterialCreate, MaterialResponse
from backend.notify_helper import send_notification

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=list[MaterialResponse])
async def list_materials(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Material).order_by(Material.added_at.desc()))
    return result.scalars().all()


@router.post("/", response_model=MaterialResponse, status_code=201)
async def create_material(payload: MaterialCreate, db: AsyncSession = Depends(get_db)):
    mat = Material(**payload.model_dump())
    db.add(mat)
    await db.commit()
    await db.refresh(mat)

    # Notify ALL users about the new material
    users_result = await db.execute(select(User).where(User.role == "user"))
    users = users_result.scalars().all()
    for u in users:
        await send_notification(
            db,
            user_id=u.user_id,
            title=f"New Material: {mat.name}",
            message=(
                f"Admin added a new material: {mat.name} ({mat.category}) — "
                f"{mat.quantity} {mat.unit} @ ₹{mat.price}. Available for purchase."
            ),
            notif_type="info",
        )

    logger.info(f"Material created: {mat.name}, notified {len(users)} users")
    return mat


@router.put("/{mat_id}", response_model=MaterialResponse)
async def update_material(mat_id: int, payload: MaterialCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Material).where(Material.id == mat_id))
    mat = result.scalar_one_or_none()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    for k, v in payload.model_dump().items():
        setattr(mat, k, v)
    await db.execute(text("UPDATE scms.materials SET modified_at=NOW() WHERE id=:id"), {"id": mat_id})
    await db.commit()
    await db.refresh(mat)
    return mat


@router.delete("/{mat_id}")
async def delete_material(mat_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Material).where(Material.id == mat_id))
    mat = result.scalar_one_or_none()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    await db.delete(mat)
    await db.commit()
    return {"ok": True}
