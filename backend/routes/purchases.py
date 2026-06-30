import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import Optional
from backend.database import get_db
from backend.models import PurchaseRequest, Material, User
from backend.schemas import PurchaseRequestCreate, PurchaseRequestResponse
from backend.notify_helper import send_notification

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=list[PurchaseRequestResponse])
async def list_requests(
    user_id: Optional[str] = Query(None),
    status:  Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(PurchaseRequest).order_by(PurchaseRequest.created_on.desc())
    if user_id: q = q.where(PurchaseRequest.user_id == user_id)
    if status:  q = q.where(PurchaseRequest.status == status)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/", response_model=PurchaseRequestResponse, status_code=201)
async def create_request(payload: PurchaseRequestCreate, db: AsyncSession = Depends(get_db)):
    # Verify material exists
    mat_result = await db.execute(select(Material).where(Material.id == payload.material_id))
    mat = mat_result.scalar_one_or_none()
    if not mat:
        raise HTTPException(404, "Material not found")

    req = PurchaseRequest(
        user_id=payload.user_id,
        user_name=payload.user_name,
        material_id=payload.material_id,
        material_name=mat.name,
        quantity=payload.quantity,
        status="Pending",
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)
    logger.info(f"Purchase request created: {req.id} by {req.user_id}")
    return req


@router.post("/{req_id}/approve", response_model=PurchaseRequestResponse)
async def approve_request(req_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PurchaseRequest).where(PurchaseRequest.id == req_id))
    req = result.scalar_one_or_none()
    if not req: raise HTTPException(404, "Request not found")
    if req.status != "Pending": raise HTTPException(400, f"Already {req.status}")

    # Deduct stock
    await db.execute(
        text("UPDATE scms.materials SET quantity = GREATEST(0, quantity - :qty) WHERE id = :id"),
        {"qty": req.quantity, "id": req.material_id},
    )
    req.status = "Approved"
    req.resolved_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(req)

    # Find user_id by username to send notification
    user_result = await db.execute(select(User).where(User.username == req.user_id))
    user = user_result.scalar_one_or_none()
    if user:
        await send_notification(
            db, user_id=user.user_id,
            title="Purchase Request Approved",
            message=f"Your request for {req.quantity} × {req.material_name} has been approved.",
            notif_type="success",
        )
    return req


@router.post("/{req_id}/reject", response_model=PurchaseRequestResponse)
async def reject_request(req_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PurchaseRequest).where(PurchaseRequest.id == req_id))
    req = result.scalar_one_or_none()
    if not req: raise HTTPException(404, "Request not found")
    if req.status != "Pending": raise HTTPException(400, f"Already {req.status}")

    req.status = "Rejected"
    req.resolved_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(req)
    return req
