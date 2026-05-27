from datetime import datetime
from decimal import Decimal
from typing import Annotated, List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field
from pydantic.types import condecimal


# ==================== Auth Schemas ====================
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_role: str
    user_name: str


# ==================== User Schemas ====================
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = Field(..., pattern="^(admin|officer)$")


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    is_active: bool

    model_config = {"from_attributes": True}


# ==================== CarModel Schemas ====================
class CarModelCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    base_suffix: Optional[str] = Field(None, max_length=50)
    variant: Optional[str] = Field(None, max_length=50)


class CarModelUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    base_suffix: Optional[str] = Field(None, max_length=50)
    variant: Optional[str] = Field(None, max_length=50)


class CarModelResponse(BaseModel):
    id: UUID
    name: str
    base_suffix: Optional[str]
    variant: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ==================== SlabRule Schemas ====================
class SlabRuleCreate(BaseModel):
    min_qty: int = Field(..., gt=0)
    max_qty: Optional[int] = Field(None, gt=0)
    incentive_per_car: Decimal = Field(..., gt=0)


class SlabRuleUpdate(BaseModel):
    min_qty: Optional[int] = Field(None, gt=0)
    max_qty: Optional[int] = Field(None, gt=0)
    incentive_per_car: Optional[Decimal] = Field(None, gt=0)


class SlabRuleResponse(BaseModel):
    id: UUID
    min_qty: int
    max_qty: Optional[int]
    incentive_per_car: Decimal
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ==================== SalesEntry Schemas ====================
class SalesEntryUpsert(BaseModel):
    car_model_id: UUID
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2000)
    units_sold: int = Field(..., ge=0)


class SalesEntryResponse(BaseModel):
    id: UUID
    officer_id: UUID
    car_model_id: UUID
    car_model_name: Optional[str] = None
    month: int
    year: int
    units_sold: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ==================== Incentive Breakdown Schemas ====================
class PerModelBreakdown(BaseModel):
    car_model_name: str
    units_sold: int


class IncentiveBreakdown(BaseModel):
    total_units_sold: int
    matched_slab: Optional[SlabRuleResponse] = None
    total_payout: Decimal
    next_slab: Optional[SlabRuleResponse] = None
    units_to_next_slab: Optional[int] = None
    per_model_breakdown: List[PerModelBreakdown]

    model_config = {"from_attributes": True}
