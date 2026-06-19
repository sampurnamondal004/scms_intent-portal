import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.database import init_db
from backend.routes.indent import router as indent_router

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s:%(name)s:%(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SCMS Indent Portal",
    description=(
        "Supply Chain Management System — Indent (purchase requisition) portal. "
        "Integrated with the real-time notification backend via PostgreSQL pg_notify + WebSocket."
    ),
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(indent_router, prefix="/api/indent", tags=["Indent"])


@app.get("/health", tags=["Root"])
async def health():
    return {
        "status": "SCMS Indent Portal running",
        "port": 8001,
        "notification_backend": "http://localhost:8000",
        "docs": "http://localhost:8001/docs"
    }


@app.on_event("startup")
async def startup():
    await init_db()
    logger.info("SCMS Indent Portal started on port 8001")
    logger.info("Notification backend expected at http://localhost:8000")


# Serve the built frontend (frontend/dist) if present. Registered LAST so
# the catch-all "/" mount never shadows the API routes or /health above —
# Starlette matches routes in registration order.
STATIC_DIR = os.getenv("STATIC_DIR", "frontend/dist")
if os.path.exists(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
else:
    logger.info(f"Static dir '{STATIC_DIR}' not found — frontend will not be served by this process.")
