import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import init_db
from backend.routes.auth          import router as auth_router
from backend.routes.notifications  import router as notif_router
from backend.routes.employees      import router as emp_router
from backend.routes.materials      import router as mat_router
from backend.routes.stores         import router as store_router
from backend.routes.suppliers      import router as sup_router
from backend.routes.inventory      import router as inv_router
from backend.routes.manufacture    import router as mfg_router
from backend.routes.chat           import router as chat_router
from backend.routes.purchases      import router as purchase_router
from backend.routes.indent         import router as indent_router

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s:%(name)s:%(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NIC SCMS Backend",
    description=(
        "Supply Chain Management System — NIC Portal. "
        "FastAPI + PostgreSQL backend. "
        "Includes all modules from the reference indent portal."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API routes ────────────────────────────────────────────────────────────────
app.include_router(auth_router,     prefix="/api/auth",         tags=["Auth"])
app.include_router(notif_router,    prefix="/api/notifications", tags=["Notifications"])
app.include_router(emp_router,      prefix="/api/employees",     tags=["Employees"])
app.include_router(mat_router,      prefix="/api/materials",     tags=["Materials"])
app.include_router(store_router,    prefix="/api/stores",        tags=["Stores"])
app.include_router(sup_router,      prefix="/api/suppliers",     tags=["Suppliers"])
app.include_router(inv_router,      prefix="/api/inventory",     tags=["Inventory"])
app.include_router(mfg_router,      prefix="/api/manufacture",   tags=["Manufacture"])
app.include_router(chat_router,     prefix="/api/chat",          tags=["Chat"])
app.include_router(purchase_router, prefix="/api/purchases",     tags=["Purchases"])
app.include_router(indent_router,   prefix="/api/indent",        tags=["Indent"])


@app.get("/health", tags=["Root"])
async def health():
    return {
        "status": "NIC SCMS Backend running",
        "port": 8000,
        "docs": "http://localhost:8000/docs",
    }


@app.on_event("startup")
async def startup():
    await init_db()
    logger.info("NIC SCMS Backend started on http://localhost:8000")
    logger.info("API docs: http://localhost:8000/docs")
