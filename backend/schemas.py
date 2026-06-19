from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime




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
    requested_by:      int                   # user_id
    requested_by_name: Optional[str] = None
    approver_id:       Optional[int] = None  # who should approve
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
    remarks:          str   # reason is mandatory on rejection


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