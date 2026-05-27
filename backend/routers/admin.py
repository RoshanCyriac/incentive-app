from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import hash_password, require_admin
from database import get_db
from models import CarModel, SlabRule, User
from schemas import (
    CarModelCreate,
    CarModelResponse,
    CarModelUpdate,
    SlabRuleCreate,
    SlabRuleResponse,
    SlabRuleUpdate,
    UserCreate,
    UserResponse,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


# ==================== Helper Functions ====================
def validate_slab_overlap(
    db: Session,
    min_qty: int,
    max_qty: Optional[int],
    exclude_slab_id: Optional[str] = None,
) -> bool:
    """
    Validate if a new slab range overlaps with existing active slabs.

    Args:
        db: Database session
        min_qty: Minimum quantity for new slab
        max_qty: Maximum quantity for new slab (None means unlimited)
        exclude_slab_id: Slab ID to exclude from check (useful for updates)

    Returns:
        True if overlap detected, False if no overlap

    Raises:
        HTTPException: 400 Bad Request if overlap detected
    """
    # Get all active slabs
    query = db.query(SlabRule).filter(SlabRule.is_active == True)

    if exclude_slab_id:
        query = query.filter(SlabRule.id != exclude_slab_id)

    existing_slabs = query.all()

    for slab in existing_slabs:
        # Check if ranges overlap
        # Two ranges [a,b] and [c,d] overlap if: a <= d and c <= b

        slab_max = slab.max_qty if slab.max_qty is not None else float("inf")
        new_max = max_qty if max_qty is not None else float("inf")

        if min_qty <= slab_max and slab.min_qty <= new_max:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Slab range overlaps with existing slab: {slab.min_qty}-{slab.max_qty}",
            )

    return False


# ==================== Car Model Endpoints ====================
@router.get("/cars", response_model=List[CarModelResponse])
async def get_car_models(
    admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    """
    Get all active car models.

    Args:
        admin: Admin user (validated by require_admin dependency)
        db: Database session

    Returns:
        List of active car models as CarModelResponse
    """
    car_models = (
        db.query(CarModel)
        .filter(CarModel.is_active == True)
        .order_by(CarModel.created_at.desc())
        .all()
    )
    return car_models


@router.post("/cars", response_model=CarModelResponse, status_code=status.HTTP_201_CREATED)
async def create_car_model(
    request: CarModelCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Create a new car model.

    Args:
        request: CarModelCreate schema
        admin: Admin user (validated by require_admin dependency)
        db: Database session

    Returns:
        Created car model as CarModelResponse with 201 status
    """
    car_model = CarModel(
        name=request.name,
        base_suffix=request.base_suffix,
        variant=request.variant,
    )
    db.add(car_model)
    db.commit()
    db.refresh(car_model)
    return car_model


@router.put("/cars/{car_id}", response_model=CarModelResponse)
async def update_car_model(
    car_id: str,
    request: CarModelUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Update an existing car model.

    Args:
        car_id: Car model ID (UUID)
        request: CarModelUpdate schema with optional fields
        admin: Admin user (validated by require_admin dependency)
        db: Database session

    Returns:
        Updated car model as CarModelResponse

    Raises:
        HTTPException: 404 Not Found if car model doesn't exist
    """
    car_model = db.query(CarModel).filter(CarModel.id == car_id).first()

    if not car_model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car model not found",
        )

    # Update only provided fields
    if request.name is not None:
        car_model.name = request.name
    if request.base_suffix is not None:
        car_model.base_suffix = request.base_suffix
    if request.variant is not None:
        car_model.variant = request.variant

    db.commit()
    db.refresh(car_model)
    return car_model


@router.delete("/cars/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_car_model(
    car_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Soft delete a car model by setting is_active to False.

    Args:
        car_id: Car model ID (UUID)
        admin: Admin user (validated by require_admin dependency)
        db: Database session

    Raises:
        HTTPException: 404 Not Found if car model doesn't exist
    """
    car_model = db.query(CarModel).filter(CarModel.id == car_id).first()

    if not car_model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car model not found",
        )

    car_model.is_active = False
    db.commit()


# ==================== Slab Rule Endpoints ====================
@router.get("/slabs", response_model=List[SlabRuleResponse])
async def get_slabs(
    admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    """
    Get all active slab rules ordered by minimum quantity ascending.

    Args:
        admin: Admin user (validated by require_admin dependency)
        db: Database session

    Returns:
        List of active slabs ordered by min_qty ascending
    """
    slabs = (
        db.query(SlabRule)
        .filter(SlabRule.is_active == True)
        .order_by(SlabRule.min_qty.asc())
        .all()
    )
    return slabs


@router.post("/slabs", response_model=SlabRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_slab(
    request: SlabRuleCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Create a new slab rule with overlap validation.

    Args:
        request: SlabRuleCreate schema
        admin: Admin user (validated by require_admin dependency)
        db: Database session

    Returns:
        Created slab rule as SlabRuleResponse with 201 status

    Raises:
        HTTPException: 400 Bad Request if slab range overlaps with existing slab
    """
    # Validate no overlapping ranges
    validate_slab_overlap(db, request.min_qty, request.max_qty)

    slab = SlabRule(
        min_qty=request.min_qty,
        max_qty=request.max_qty,
        incentive_per_car=request.incentive_per_car,
    )
    db.add(slab)
    db.commit()
    db.refresh(slab)
    return slab


@router.put("/slabs/{slab_id}", response_model=SlabRuleResponse)
async def update_slab(
    slab_id: str,
    request: SlabRuleUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Update an existing slab rule with overlap re-validation.

    Args:
        slab_id: Slab rule ID (UUID)
        request: SlabRuleUpdate schema with optional fields
        admin: Admin user (validated by require_admin dependency)
        db: Database session

    Returns:
        Updated slab rule as SlabRuleResponse

    Raises:
        HTTPException: 404 Not Found if slab doesn't exist
        HTTPException: 400 Bad Request if updated range overlaps with other slabs
    """
    slab = db.query(SlabRule).filter(SlabRule.id == slab_id).first()

    if not slab:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slab rule not found",
        )

    # Prepare new values for overlap check
    min_qty = request.min_qty if request.min_qty is not None else slab.min_qty
    max_qty = request.max_qty if request.max_qty is not None else slab.max_qty

    # Validate no overlapping ranges (excluding current slab)
    validate_slab_overlap(db, min_qty, max_qty, exclude_slab_id=slab_id)

    # Update only provided fields
    if request.min_qty is not None:
        slab.min_qty = request.min_qty
    if request.max_qty is not None:
        slab.max_qty = request.max_qty
    if request.incentive_per_car is not None:
        slab.incentive_per_car = request.incentive_per_car

    db.commit()
    db.refresh(slab)
    return slab


@router.delete("/slabs/{slab_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_slab(
    slab_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Hard delete a slab rule (safe for small reference table).

    Args:
        slab_id: Slab rule ID (UUID)
        admin: Admin user (validated by require_admin dependency)
        db: Database session

    Raises:
        HTTPException: 404 Not Found if slab doesn't exist
    """
    slab = db.query(SlabRule).filter(SlabRule.id == slab_id).first()

    if not slab:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slab rule not found",
        )

    db.delete(slab)
    db.commit()


# ==================== User Management Endpoints ====================
@router.get("/users", response_model=List[UserResponse])
async def get_officers(
    admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    """
    Get all officers (users with role='officer').

    Args:
        admin: Admin user (validated by require_admin dependency)
        db: Database session

    Returns:
        List of officers as UserResponse
    """
    officers = (
        db.query(User)
        .filter(User.role == "officer")
        .order_by(User.created_at.desc())
        .all()
    )
    return officers


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_officer(
    request: UserCreate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Create a new officer account with hashed password.

    Args:
        request: UserCreate schema
        admin: Admin user (validated by require_admin dependency)
        db: Database session

    Returns:
        Created officer as UserResponse with 201 status

    Raises:
        HTTPException: 400 Bad Request if email already exists or role is not officer
    """
    # Validate role is officer
    if request.role != "officer":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only officers can be created via this endpoint",
        )

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new user with hashed password
    user = User(
        name=request.name,
        email=request.email,
        password_hash=hash_password(request.password),
        role=request.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
    )
