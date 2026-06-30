from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import Optional
from backend.database import get_db
from backend.models import ChatMessage
from backend.schemas import ChatMessageCreate, ChatMessageResponse

router = APIRouter()

@router.get("/", response_model=list[ChatMessageResponse])
async def list_messages(
    from_user: Optional[str] = Query(None),
    to_user:   Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(ChatMessage).order_by(ChatMessage.created_on.asc())
    if from_user: q = q.where(ChatMessage.from_user == from_user)
    if to_user:   q = q.where(ChatMessage.to_user == to_user)
    result = await db.execute(q)
    return result.scalars().all()

@router.get("/thread", response_model=list[ChatMessageResponse])
async def get_thread(
    user: str = Query(..., description="The non-admin username"),
    db: AsyncSession = Depends(get_db),
):
    """Return all messages between a given user and Admin (both directions)."""
    result = await db.execute(
        select(ChatMessage).where(
            (ChatMessage.from_user == user) | (ChatMessage.to_user == user)
        ).order_by(ChatMessage.created_on.asc())
    )
    return result.scalars().all()

@router.post("/", response_model=ChatMessageResponse, status_code=201)
async def send_message(payload: ChatMessageCreate, db: AsyncSession = Depends(get_db)):
    msg = ChatMessage(**payload.model_dump())
    db.add(msg); await db.commit(); await db.refresh(msg)
    return msg

@router.patch("/mark-admin-read")
async def mark_admin_read(from_user: str = Query(...), db: AsyncSession = Depends(get_db)):
    await db.execute(
        text("UPDATE public.chat_messages SET read_by_admin=TRUE WHERE from_user=:u"),
        {"u": from_user},
    )
    await db.commit()
    return {"ok": True}

@router.patch("/mark-user-read")
async def mark_user_read(to_user: str = Query(...), db: AsyncSession = Depends(get_db)):
    await db.execute(
        text("UPDATE public.chat_messages SET read_by_user=TRUE WHERE to_user=:u AND from_user='Admin'"),
        {"u": to_user},
    )
    await db.commit()
    return {"ok": True}
