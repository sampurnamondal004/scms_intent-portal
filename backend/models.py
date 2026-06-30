from sqlalchemy import (
    Column, Integer, String, Text, Numeric, Boolean,
    TIMESTAMP, ARRAY, func
)
from sqlalchemy.dialects.postgresql import JSONB
from backend.database import Base


# ── public schema ──────────────────────────────────────────────────────────────

class User(Base):
    __tablename__  = "users"
    __table_args__ = {"schema": "public"}

    user_id    = Column(Integer, primary_key=True, autoincrement=True)
    username   = Column(String(100), unique=True, nullable=False)
    password   = Column(String(255), nullable=False)   # bcrypt hash
    name       = Column(String(200), nullable=False)
    department = Column(String(200))
    role       = Column(String(20), default="user")    # 'admin' | 'user'
    emp_id     = Column(String(50))
    status     = Column(String(20), default="Active")
    created_on = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Notification(Base):
    __tablename__  = "notifications"
    __table_args__ = {"schema": "public"}

    notification_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id         = Column(Integer, nullable=False)
    title           = Column(String(300), nullable=False, default="Notification")
    message         = Column(Text, nullable=False)
    type            = Column(String(20), nullable=False, default="info")
    is_read         = Column(Boolean, nullable=False, default=False)
    bookmarked_by   = Column(ARRAY(Integer), default=[])
    replies         = Column(JSONB, default=[])
    created_on      = Column(TIMESTAMP(timezone=True), server_default=func.now())


class ChatMessage(Base):
    __tablename__  = "chat_messages"
    __table_args__ = {"schema": "public"}

    id            = Column(Integer, primary_key=True, autoincrement=True)
    from_user     = Column(String(100), nullable=False)
    to_user       = Column(String(100), nullable=False)
    message       = Column(Text, nullable=False)
    read_by_admin = Column(Boolean, default=False)
    read_by_user  = Column(Boolean, default=False)
    created_on    = Column(TIMESTAMP(timezone=True), server_default=func.now())


class PurchaseRequest(Base):
    __tablename__  = "purchase_requests"
    __table_args__ = {"schema": "public"}

    id            = Column(Integer, primary_key=True, autoincrement=True)
    user_id       = Column(String(100), nullable=False)
    user_name     = Column(String(200))
    material_id   = Column(Integer, nullable=False)
    material_name = Column(String(300))
    quantity      = Column(Integer, nullable=False)
    status        = Column(String(20), default="Pending")
    resolved_at   = Column(TIMESTAMP(timezone=True))
    created_on    = Column(TIMESTAMP(timezone=True), server_default=func.now())


# ── scms schema ───────────────────────────────────────────────────────────────

class Employee(Base):
    __tablename__  = "employees"
    __table_args__ = {"schema": "scms"}

    id         = Column(Integer, primary_key=True, autoincrement=True)
    emp_id     = Column(String(50), unique=True, nullable=False)
    name       = Column(String(200), nullable=False)
    department = Column(String(200))
    email      = Column(String(200))
    phone      = Column(String(30))
    status     = Column(String(20), default="Active")
    joined_at  = Column(TIMESTAMP(timezone=True), server_default=func.now())


class Material(Base):
    __tablename__  = "materials"
    __table_args__ = {"schema": "scms"}

    id          = Column(Integer, primary_key=True, autoincrement=True)
    name        = Column(String(300), nullable=False)
    category    = Column(String(100))
    quantity    = Column(Integer, default=0)
    unit        = Column(String(50), default="pcs")
    price       = Column(Numeric(12, 2), default=0)
    description = Column(Text)
    added_by    = Column(String(200), default="Admin")
    added_at    = Column(TIMESTAMP(timezone=True), server_default=func.now())
    modified_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class Store(Base):
    __tablename__  = "stores"
    __table_args__ = {"schema": "scms"}

    id       = Column(Integer, primary_key=True, autoincrement=True)
    store_id = Column(String(50), unique=True, nullable=False)
    name     = Column(String(200), nullable=False)
    location = Column(String(200))
    manager  = Column(String(200))
    capacity = Column(Integer, default=0)
    status   = Column(String(20), default="Active")


class Supplier(Base):
    __tablename__  = "suppliers"
    __table_args__ = {"schema": "scms"}

    id          = Column(Integer, primary_key=True, autoincrement=True)
    supplier_id = Column(String(50), unique=True, nullable=False)
    name        = Column(String(300), nullable=False)
    contact     = Column(String(200))
    phone       = Column(String(30))
    email       = Column(String(200))
    materials   = Column(Text)
    status      = Column(String(20), default="Active")


class Inventory(Base):
    __tablename__  = "inventory"
    __table_args__ = {"schema": "scms"}

    id        = Column(Integer, primary_key=True, autoincrement=True)
    item_code = Column(String(50), unique=True, nullable=False)
    name      = Column(String(300), nullable=False)
    category  = Column(String(100))
    quantity  = Column(Integer, default=0)
    min_qty   = Column(Integer, default=0)
    unit      = Column(String(50), default="pcs")
    location  = Column(String(200))
    supplier  = Column(String(300))


class Manufacture(Base):
    __tablename__  = "manufacture"
    __table_args__ = {"schema": "scms"}

    id         = Column(Integer, primary_key=True, autoincrement=True)
    order_id   = Column(String(50), unique=True, nullable=False)
    product    = Column(String(300), nullable=False)
    quantity   = Column(Integer, default=0)
    status     = Column(String(30), default="Planned")
    materials  = Column(JSONB, default=[])
    start_date = Column(TIMESTAMP(timezone=True), server_default=func.now())
    end_date   = Column(TIMESTAMP(timezone=True))


# ── Indent tables (from reference project — kept intact) ──────────────────────

class IndentMaster(Base):
    __tablename__  = "indent_master"
    __table_args__ = {"schema": "scms"}

    indent_id         = Column(Integer, primary_key=True, autoincrement=True)
    indent_no         = Column(String(50), unique=True, nullable=False)
    item_name         = Column(String(300), nullable=False)
    quantity          = Column(Integer, nullable=False)
    uom               = Column(String(50))
    requested_by      = Column(Integer, nullable=False)
    requested_by_name = Column(String(200))
    approver_id       = Column(Integer)
    store_id          = Column(Integer)
    dept_code         = Column(Integer)
    dist_code         = Column(Integer)
    purpose           = Column(Text)
    status            = Column(String(20), default="PENDING")
    remarks           = Column(Text)
    approved_by       = Column(Integer)
    approved_by_name  = Column(String(200))
    approved_on       = Column(TIMESTAMP(timezone=True))
    created_on        = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_on        = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class IndentItem(Base):
    __tablename__  = "indent_items"
    __table_args__ = {"schema": "scms"}

    item_id     = Column(Integer, primary_key=True, autoincrement=True)
    indent_id   = Column(Integer, nullable=False)
    material_id = Column(Integer)
    item_name   = Column(String(300), nullable=False)
    quantity    = Column(Integer, nullable=False)
    uom         = Column(String(50))
    unit_price  = Column(Numeric(12, 2), default=0)
