from pydantic import BaseModel, field_validator
from typing import Optional, List, Any
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class SignUpRequest(BaseModel):
    username:   str
    password:   str
    name:       str
    department: Optional[str] = "Employee"

class SignInRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    user_id:    int
    username:   str
    name:       str
    department: Optional[str]
    role:       str
    emp_id:     Optional[str]
    status:     str
    created_on: Optional[datetime]
    class Config:
        from_attributes = True


# ── Notifications ─────────────────────────────────────────────────────────────

class NotificationCreate(BaseModel):
    user_id: int       # broadcast: 0 = all users
    title:   str
    message: str
    type:    Optional[str] = "info"

class NotificationReply(BaseModel):
    from_user: str
    message:   str

class NotificationResponse(BaseModel):
    notification_id: int
    user_id:         int
    title:           str
    message:         str
    type:            str
    is_read:         bool
    bookmarked_by:   Optional[List[int]] = []
    replies:         Optional[List[Any]] = []
    created_on:      Optional[datetime]
    class Config:
        from_attributes = True


# ── Employees ─────────────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    emp_id:     str
    name:       str
    department: Optional[str] = None
    email:      Optional[str] = None
    phone:      Optional[str] = None
    status:     Optional[str] = "Active"

class EmployeeResponse(EmployeeCreate):
    id:        int
    joined_at: Optional[datetime]
    class Config:
        from_attributes = True


# ── Materials ─────────────────────────────────────────────────────────────────

class MaterialCreate(BaseModel):
    name:        str
    category:    Optional[str] = None
    quantity:    int = 0
    unit:        Optional[str] = "pcs"
    price:       Optional[float] = 0.0
    description: Optional[str] = None

class MaterialResponse(MaterialCreate):
    id:          int
    added_by:    Optional[str]
    added_at:    Optional[datetime]
    modified_at: Optional[datetime]
    class Config:
        from_attributes = True


# ── Stores ────────────────────────────────────────────────────────────────────

class StoreCreate(BaseModel):
    store_id: str
    name:     str
    location: Optional[str] = None
    manager:  Optional[str] = None
    capacity: Optional[int] = 0
    status:   Optional[str] = "Active"

class StoreResponse(StoreCreate):
    id: int
    class Config:
        from_attributes = True


# ── Suppliers ─────────────────────────────────────────────────────────────────

class SupplierCreate(BaseModel):
    supplier_id: str
    name:        str
    contact:     Optional[str] = None
    phone:       Optional[str] = None
    email:       Optional[str] = None
    materials:   Optional[str] = None
    status:      Optional[str] = "Active"

class SupplierResponse(SupplierCreate):
    id: int
    class Config:
        from_attributes = True


# ── Inventory ─────────────────────────────────────────────────────────────────

class InventoryCreate(BaseModel):
    item_code: str
    name:      str
    category:  Optional[str] = None
    quantity:  int = 0
    min_qty:   int = 0
    unit:      Optional[str] = "pcs"
    location:  Optional[str] = None
    supplier:  Optional[str] = None

class InventoryResponse(InventoryCreate):
    id: int
    class Config:
        from_attributes = True


# ── Manufacture ───────────────────────────────────────────────────────────────

class ManufactureCreate(BaseModel):
    order_id:  str
    product:   str
    quantity:  int = 0
    status:    Optional[str] = "Planned"
    materials: Optional[List[str]] = []
    end_date:  Optional[datetime] = None

class ManufactureResponse(ManufactureCreate):
    id:         int
    start_date: Optional[datetime]
    class Config:
        from_attributes = True


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatMessageCreate(BaseModel):
    from_user: str
    to_user:   str
    message:   str

class ChatMessageResponse(ChatMessageCreate):
    id:            int
    read_by_admin: bool
    read_by_user:  bool
    created_on:    Optional[datetime]
    class Config:
        from_attributes = True


# ── Purchase Requests ─────────────────────────────────────────────────────────

class PurchaseRequestCreate(BaseModel):
    user_id:     str
    user_name:   Optional[str] = None
    material_id: int
    quantity:    int

    @field_validator("quantity")
    @classmethod
    def qty_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be > 0")
        return v

class PurchaseRequestResponse(BaseModel):
    id:            int
    user_id:       str
    user_name:     Optional[str]
    material_id:   int
    material_name: Optional[str]
    quantity:      int
    status:        str
    resolved_at:   Optional[datetime]
    created_on:    Optional[datetime]
    class Config:
        from_attributes = True


# ── Indent (from reference project) ──────────────────────────────────────────

class IndentItemCreate(BaseModel):
    material_id: Optional[int] = None
    item_name:   str
    quantity:    int
    uom:         Optional[str] = None
    unit_price:  Optional[float] = 0.0

class IndentItemResponse(IndentItemCreate):
    item_id:   int
    indent_id: int
    class Config:
        from_attributes = True

class IndentCreate(BaseModel):
    item_name:         str
    quantity:          int
    uom:               Optional[str] = None
    requested_by:      int
    requested_by_name: Optional[str] = None
    approver_id:       Optional[int] = None
    store_id:          Optional[int] = None
    dept_code:         Optional[int] = None
    dist_code:         Optional[int] = None
    purpose:           Optional[str] = None
    items:             Optional[List[IndentItemCreate]] = []

    @field_validator("quantity")
    @classmethod
    def qty_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v

class IndentApprove(BaseModel):
    approved_by:      int
    approved_by_name: Optional[str] = None
    remarks:          Optional[str] = None

class IndentReject(BaseModel):
    rejected_by:      int
    rejected_by_name: Optional[str] = None
    remarks:          str

class IndentResponse(BaseModel):
    indent_id:         int
    indent_no:         str
    item_name:         str
    quantity:          int
    uom:               Optional[str]
    requested_by:      int
    requested_by_name: Optional[str]
    approver_id:       Optional[int]
    store_id:          Optional[int]
    dept_code:         Optional[int]
    dist_code:         Optional[int]
    purpose:           Optional[str]
    status:            str
    remarks:           Optional[str]
    approved_by:       Optional[int]
    approved_by_name:  Optional[str]
    approved_on:       Optional[datetime]
    created_on:        Optional[datetime]
    updated_on:        Optional[datetime]
    class Config:
        from_attributes = True

class IndentListResponse(BaseModel):
    total:   int
    indents: List[IndentResponse]
