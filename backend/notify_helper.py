import logging
import os

import httpx

logger = logging.getLogger(__name__)

NOTIFICATION_SERVICE_URL = os.getenv(
    "NOTIFICATION_SERVICE_URL", "http://localhost:8000"
)


async def send_notification(user_id: int, message: str) -> None:
    url = f"{NOTIFICATION_SERVICE_URL}/api/notifications/send"
    payload = {"user_id": user_id, "message": message}

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
        logger.info(f"Notification -> user {user_id}: {message}")
    except Exception as e:
        logger.error(f"Notification service call failed: {e}")