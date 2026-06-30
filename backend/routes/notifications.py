import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import Optional

from backend.database import get_db
from backend.models import Notification, User
from backend.schemas import NotificationCreate, NotificationResponse, NotificationReply

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/send", response_model=list[NotificationResponse], status_code=201)
async def send_notification(payload: NotificationCreate, db: AsyncSession = Depends(get_db)):
    """Send notification to one user (user_id > 0) or ALL users (user_id == 0 = broadcast)."""
    if payload.user_id == 0:
        result = await db.execute(select(User).where(User.role == "user"))
        users = result.scalars().all()
        notifs = []
        for u in users:
            n = Notification(
                user_id=u.user_id, title=payload.title,
                message=payload.message, type=payload.type,
                bookmarked_by=[], replies=[],
            )
            db.add(n)
            notifs.append(n)
        await db.commit()
        for n in notifs:
            await db.refresh(n)
        return notifs
    else:
        n = Notification(
            user_id=payload.user_id, title=payload.title,
            message=payload.message, type=payload.type,
            bookmarked_by=[], replies=[],
        )
        db.add(n)
        await db.commit()
        await db.refresh(n)
        return [n]


@router.get("/all", response_model=list[NotificationResponse])
async def list_all_notifications(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).order_by(Notification.created_on.desc()))
    return result.scalars().all()


@router.get("/list", response_model=list[NotificationResponse])
async def list_notifications(
    user_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    q = select(Notification).order_by(Notification.created_on.desc())
    if user_id is not None:
        q = q.where(Notification.user_id == user_id)
    result = await db.execute(q)
    return result.scalars().all()


@router.patch("/mark-all-read")
async def mark_all_read(user_id: int = Query(...), db: AsyncSession = Depends(get_db)):
    # user_id=0 → mark all (admin view); otherwise mark for that user
    if user_id == 0:
        await db.execute(text("UPDATE public.notifications SET is_read=TRUE"))
    else:
        await db.execute(
            text("UPDATE public.notifications SET is_read=TRUE WHERE user_id=:uid"),
            {"uid": user_id},
        )
    await db.commit()
    return {"ok": True}


@router.patch("/{nid}/read")
async def mark_read(nid: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).where(Notification.notification_id == nid))
    n = result.scalar_one_or_none()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    n.is_read = True
    await db.commit()
    return {"ok": True}


@router.patch("/{nid}/bookmark")
async def toggle_bookmark(nid: int, user_id: int = Query(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).where(Notification.notification_id == nid))
    n = result.scalar_one_or_none()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    bm = list(n.bookmarked_by or [])
    if user_id in bm:
        bm.remove(user_id)
    else:
        bm.append(user_id)
    n.bookmarked_by = bm
    await db.commit()
    return {"bookmarked_by": bm}


class BookmarkByUsernameRequest(BaseModel):
    username: str


@router.patch("/{nid}/bookmark-by-username")
async def toggle_bookmark_by_username(
    nid: int,
    payload: BookmarkByUsernameRequest,
    db: AsyncSession = Depends(get_db),
):
    """Toggle bookmark using username (used by UserPortal which stores usernames not user_ids)."""
    # Look up user_id from username
    user_result = await db.execute(select(User).where(User.username == payload.username))
    user = user_result.scalar_one_or_none()
    uid = user.user_id if user else -1  # -1 = unknown user, still persist the toggle

    result = await db.execute(select(Notification).where(Notification.notification_id == nid))
    n = result.scalar_one_or_none()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    bm = list(n.bookmarked_by or [])
    if uid in bm:
        bm.remove(uid)
    else:
        bm.append(uid)
    n.bookmarked_by = bm
    await db.commit()
    return {"bookmarked_by": bm}


@router.post("/{nid}/reply", response_model=NotificationResponse)
async def add_reply(nid: int, payload: NotificationReply, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).where(Notification.notification_id == nid))
    n = result.scalar_one_or_none()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    replies = list(n.replies or [])
    replies.append({"from": payload.from_user, "message": payload.message,
                    "time": datetime.now(timezone.utc).isoformat()})
    n.replies = replies
    await db.commit()
    await db.refresh(n)
    return n


@router.delete("/{nid}")
async def delete_notification(nid: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).where(Notification.notification_id == nid))
    n = result.scalar_one_or_none()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found")
    await db.delete(n)
    await db.commit()
    return {"ok": True}
