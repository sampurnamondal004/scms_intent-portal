import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
 
logger = logging.getLogger(__name__)
 
 
async def send_notification(db: AsyncSession, user_id: int, message: str) -> None:
    try:
        await db.execute(
            text(
                "INSERT INTO public.notifications (user_id, message) "
                "VALUES (:user_id, :message)"
            ),
            {"user_id": user_id, "message": message},
        )
        await db.commit()
        logger.info(f" Notification → user {user_id}: {message}")
    except Exception as e:
        logger.error(f"Notification failed: {e}")