import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from routes.indent import router as indent_router

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



import os
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

    @app.get("/", include_in_schema=False)
    async def serve_frontend():
        return FileResponse("static/index.html")



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
    logger.info("SCMS Indent Portal started on port 8001")
    logger.info("Notification backend expected at http://localhost:8000")