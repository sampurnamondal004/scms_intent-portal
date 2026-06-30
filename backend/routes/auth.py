import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.models import User
from backend.schemas import SignUpRequest, SignInRequest, UserResponse

try:
    from passlib.context import CryptContext
    _pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
    def hash_pw(pw: str) -> str:   return _pwd_ctx.hash(pw)
    def verify_pw(pw: str, h: str) -> bool: return _pwd_ctx.verify(pw, h)
except Exception:
    # Fallback: plain-text comparison (dev only — install passlib[bcrypt] for production)
    def hash_pw(pw: str) -> str:   return pw
    def verify_pw(pw: str, h: str) -> bool: return pw == h

router = APIRouter()
logger = logging.getLogger(__name__)

ADMIN_USERNAME = "TRP_RDD_2301"
ADMIN_PASSWORD = "Scms@2301"


@router.post("/signup", response_model=UserResponse, status_code=201)
async def signup(payload: SignUpRequest, db: AsyncSession = Depends(get_db)):
    # Prevent anyone from signing up as admin
    if payload.username.strip().lower() == ADMIN_USERNAME.lower():
        raise HTTPException(status_code=400, detail="Username not allowed.")

    existing = await db.execute(select(User).where(User.username == payload.username.strip()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Username already taken.")

    user = User(
        username=payload.username.strip(),
        password=hash_pw(payload.password),
        name=payload.name.strip(),
        department=payload.department or "Employee",
        role="user",
        status="Active",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    logger.info(f"New user signed up: {user.username}")
    return user


@router.post("/signin")
async def signin(payload: SignInRequest, db: AsyncSession = Depends(get_db)):
    # Admin shortcut (credentials not stored hashed for the seed admin)
    if payload.username == ADMIN_USERNAME:
        if payload.password != ADMIN_PASSWORD:
            raise HTTPException(status_code=401, detail="Invalid credentials.")
        return {
            "user_id": 0,
            "username": ADMIN_USERNAME,
            "name": "Admin",
            "role": "admin",
            "department": "Administration",
            "emp_id": None,
            "status": "Active",
        }

    result = await db.execute(select(User).where(User.username == payload.username))
    user = result.scalar_one_or_none()

    if not user:
        # Check legacy employee ID with default password
        raise HTTPException(status_code=401, detail="Account not found. Please sign up first.")

    if not verify_pw(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password.")

    if user.status != "Active":
        raise HTTPException(status_code=403, detail="Account inactive. Contact Admin.")

    return {
        "user_id":    user.user_id,
        "username":   user.username,
        "name":       user.name,
        "role":       user.role,
        "department": user.department,
        "emp_id":     user.emp_id,
        "status":     user.status,
    }


@router.get("/users", response_model=list[UserResponse])
async def list_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_on.desc()))
    return result.scalars().all()
