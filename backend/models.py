from sqlalchemy import (
    Column, Integer, String, Text, Numeric,
    TIMESTAMP, func
)
from backend.database import Base


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