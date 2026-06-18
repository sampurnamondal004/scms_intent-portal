import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db
from models import IndentMaster, IndentItem
from schemas import (
    IndentCreate, IndentApprove, IndentReject,
    IndentResponse, IndentListResponse, IndentItemResponse
)
from backend.notify_helper import send_notification

router = APIRouter()
logger = logging.getLogger(__name__)




def _generate_indent_no() -> str:
    """IND-YYYYMMDD-HHMMSS"""
    now = datetime.now(timezone.utc)
    return f"IND-{now.strftime('%Y%m%d-%H%M%S%f')[:18]}"




@router.post("/create", response_model=IndentResponse, status_code=201)
async def create_indent(
    payload: IndentCreate,
    db: AsyncSession = Depends(get_db)
):
    indent = IndentMaster(
        indent_no         = _generate_indent_no(),
        item_name         = payload.item_name,
        quantity          = payload.quantity,
        uom               = payload.uom,
        requested_by      = payload.requested_by,
        requested_by_name = payload.requested_by_name,
        approver_id       = payload.approver_id,
        store_id          = payload.store_id,
        dept_code         = payload.dept_code,
        dist_code         = payload.dist_code,
        purpose           = payload.purpose,
        status            = "PENDING",
    )
    db.add(indent)
    await db.flush()  

    
    for item_data in (payload.items or []):
        item = IndentItem(indent_id=indent.indent_id, **item_data.model_dump())
        db.add(item)

    await db.commit()
    await db.refresh(indent)
    logger.info(f"Indent created: {indent.indent_no}")


    if payload.approver_id:
        await send_notification(
            db,
            user_id=payload.approver_id,
            message=(
                f"New indent {indent.indent_no} created by "
                f"{payload.requested_by_name or payload.requested_by} — "
                f"{payload.item_name} x{payload.quantity}. Awaiting your approval."
            )
        )

    return indent




@router.get("/list", response_model=IndentListResponse)
async def list_indents(
    status:       Optional[str] = Query(None, description="PENDING | APPROVED | REJECTED"),
    requested_by: Optional[int] = Query(None),
    approver_id:  Optional[int] = Query(None),
    skip:         int = Query(0, ge=0),
    limit:        int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    query = select(IndentMaster).order_by(IndentMaster.created_on.desc())

    if status:
        query = query.where(IndentMaster.status == status.upper())
    if requested_by:
        query = query.where(IndentMaster.requested_by == requested_by)
    if approver_id:
        query = query.where(IndentMaster.approver_id == approver_id)

    
    count_q = select(func.count()).select_from(query.subquery())
    total   = (await db.execute(count_q)).scalar()

    result  = await db.execute(query.offset(skip).limit(limit))
    indents = result.scalars().all()

    return IndentListResponse(total=total, indents=indents)




@router.get("/{indent_id}", response_model=IndentResponse)
async def get_indent(indent_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(IndentMaster).where(IndentMaster.indent_id == indent_id)
    )
    indent = result.scalar_one_or_none()
    if not indent:
        raise HTTPException(status_code=404, detail="Indent not found")
    return indent




@router.get("/{indent_id}/items", response_model=List[IndentItemResponse])
async def get_indent_items(indent_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(IndentItem).where(IndentItem.indent_id == indent_id)
    )
    return result.scalars().all()




@router.post("/{indent_id}/approve", response_model=IndentResponse)
async def approve_indent(
    indent_id: int,
    payload:   IndentApprove,
    db:        AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(IndentMaster).where(IndentMaster.indent_id == indent_id)
    )
    indent = result.scalar_one_or_none()
    if not indent:
        raise HTTPException(status_code=404, detail="Indent not found")
    if indent.status != "PENDING":
        raise HTTPException(status_code=400, detail=f"Indent is already {indent.status}")

    indent.status           = "APPROVED"
    indent.approved_by      = payload.approved_by
    indent.approved_by_name = payload.approved_by_name
    indent.remarks          = payload.remarks
    indent.approved_on      = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(indent)
    logger.info(f"Indent approved: {indent.indent_no}")


    await send_notification(
        db,
        user_id=indent.requested_by,
        message=(
            f"✅ Your indent {indent.indent_no} for {indent.item_name} x{indent.quantity} "
            f"has been APPROVED by {payload.approved_by_name or payload.approved_by}."
        )
    )

    return indent




@router.post("/{indent_id}/reject", response_model=IndentResponse)
async def reject_indent(
    indent_id: int,
    payload:   IndentReject,
    db:        AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(IndentMaster).where(IndentMaster.indent_id == indent_id)
    )
    indent = result.scalar_one_or_none()
    if not indent:
        raise HTTPException(status_code=404, detail="Indent not found")
    if indent.status != "PENDING":
        raise HTTPException(status_code=400, detail=f"Indent is already {indent.status}")

    indent.status      = "REJECTED"
    indent.approved_by = payload.rejected_by
    indent.remarks     = payload.remarks
    indent.approved_on = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(indent)
    logger.info(f"Indent rejected: {indent.indent_no}")

    
    await send_notification(
        db,
        user_id=indent.requested_by,
        message=(
            f" Your indent {indent.indent_no} for {indent.item_name} x{indent.quantity} "
            f"has been REJECTED. Reason: {payload.remarks}"
        )
    )

    return indent