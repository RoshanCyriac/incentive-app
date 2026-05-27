from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from auth import require_officer
from database import get_db
from models import CarModel, SalesEntry, SlabRule, User
from schemas import (
    CarModelResponse,
    IncentiveBreakdown,
    PerModelBreakdown,
    SalesEntryResponse,
    SalesEntryUpsert,
    SlabRuleResponse,
)

router = APIRouter(prefix="/officer", tags=["Officer"])


# ==================== Helper Functions ====================
def get_sales_for_period(
    db: Session, officer_id: str, month: int, year: int
) -> List[SalesEntry]:
    """
    Get all sales entries for an officer for a specific month/year.

    Args:
        db: Database session
        officer_id: Officer's user ID
        month: Month (1-12)
        year: Year

    Returns:
        List of SalesEntry objects
    """
    return (
        db.query(SalesEntry)
        .filter(
            and_(
                SalesEntry.officer_id == officer_id,
                SalesEntry.month == month,
                SalesEntry.year == year,
            )
        )
        .all()
    )


def calculate_incentive(
    db: Session, total_units: int
) -> tuple[Optional[SlabRule], Decimal, Optional[SlabRule], Optional[int]]:
    """
    Calculate incentive for given total units.

    Args:
        db: Database session
        total_units: Total units sold

    Returns:
        Tuple of (matched_slab, total_payout, next_slab, units_to_next_slab)
    """
    # Query all active slabs ordered by min_qty
    slabs = (
        db.query(SlabRule)
        .filter(SlabRule.is_active == True)
        .order_by(SlabRule.min_qty.asc())
        .all()
    )

    matched_slab = None
    total_payout = Decimal("0.00")
    next_slab = None
    units_to_next_slab = None

    # Find matching slab
    for slab in slabs:
        if total_units >= slab.min_qty:
            # Check if max_qty constraint is satisfied
            if slab.max_qty is None or total_units <= slab.max_qty:
                matched_slab = slab
                total_payout = Decimal(total_units) * slab.incentive_per_car

    # Find next slab
    if matched_slab:
        for slab in slabs:
            if slab.min_qty > matched_slab.min_qty:
                next_slab = slab
                units_to_next_slab = slab.min_qty - total_units
                break
    else:
        # If no slab matched, next is the first one
        if slabs:
            next_slab = slabs[0]
            units_to_next_slab = slabs[0].min_qty - total_units

    return matched_slab, total_payout, next_slab, units_to_next_slab


# ==================== Car Models Endpoint ====================
@router.get("/cars", response_model=List[CarModelResponse])
async def get_available_cars(
    officer: User = Depends(require_officer), db: Session = Depends(get_db)
):
    """
    Get all active car models for sales entry.

    Args:
        officer: Officer user (validated by require_officer dependency)
        db: Database session

    Returns:
        List of active car models as CarModelResponse
    """
    car_models = (
        db.query(CarModel)
        .filter(CarModel.is_active == True)
        .order_by(CarModel.name.asc())
        .all()
    )
    return car_models


# ==================== Sales Entry Endpoints ====================
@router.get("/sales", response_model=List[SalesEntryResponse])
async def get_sales(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    officer: User = Depends(require_officer),
    db: Session = Depends(get_db),
):
    """
    Get all sales entries for the officer for a specific month/year.

    Args:
        month: Month (1-12)
        year: Year (2000 onwards)
        officer: Officer user (validated by require_officer dependency)
        db: Database session

    Returns:
        List of SalesEntryResponse with car model names
    """
    entries = get_sales_for_period(db, str(officer.id), month, year)

    # Build response with car model names
    result = []
    for entry in entries:
        car_model = db.query(CarModel).filter(CarModel.id == entry.car_model_id).first()
        result.append(
            SalesEntryResponse(
                id=entry.id,
                officer_id=entry.officer_id,
                car_model_id=entry.car_model_id,
                car_model_name=car_model.name if car_model else None,
                month=entry.month,
                year=entry.year,
                units_sold=entry.units_sold,
                created_at=entry.created_at,
                updated_at=entry.updated_at,
            )
        )

    return result


@router.post("/sales", response_model=SalesEntryResponse, status_code=status.HTTP_201_CREATED)
async def upsert_sales(
    request: SalesEntryUpsert,
    officer: User = Depends(require_officer),
    db: Session = Depends(get_db),
):
    """
    Create or update sales entry for the officer.

    Uses INSERT ... ON CONFLICT DO UPDATE pattern to handle upserts.

    Args:
        request: SalesEntryUpsert schema
        officer: Officer user (validated by require_officer dependency)
        db: Database session

    Returns:
        Updated/created SalesEntryResponse with 201 status
    """
    # Check if entry already exists
    existing_entry = (
        db.query(SalesEntry)
        .filter(
            and_(
                SalesEntry.officer_id == officer.id,
                SalesEntry.car_model_id == request.car_model_id,
                SalesEntry.month == request.month,
                SalesEntry.year == request.year,
            )
        )
        .first()
    )

    if existing_entry:
        # Update existing entry
        existing_entry.units_sold = request.units_sold
        db.commit()
        db.refresh(existing_entry)
        entry = existing_entry
    else:
        # Create new entry
        entry = SalesEntry(
            officer_id=officer.id,
            car_model_id=request.car_model_id,
            month=request.month,
            year=request.year,
            units_sold=request.units_sold,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)

    # Fetch car model name for response
    car_model = db.query(CarModel).filter(CarModel.id == entry.car_model_id).first()

    return SalesEntryResponse(
        id=entry.id,
        officer_id=entry.officer_id,
        car_model_id=entry.car_model_id,
        car_model_name=car_model.name if car_model else None,
        month=entry.month,
        year=entry.year,
        units_sold=entry.units_sold,
        created_at=entry.created_at,
        updated_at=entry.updated_at,
    )


# ==================== Incentive Calculation Endpoint ====================
@router.get("/incentive", response_model=IncentiveBreakdown)
async def calculate_incentive_breakdown(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    officer: User = Depends(require_officer),
    db: Session = Depends(get_db),
):
    """
    Calculate incentive breakdown for the officer for a specific month/year.

    Includes:
    - Total units sold across all car models
    - Current matched slab
    - Total payout calculation
    - Next tier information
    - Per-model breakdown

    Args:
        month: Month (1-12)
        year: Year (2000 onwards)
        officer: Officer user (validated by require_officer dependency)
        db: Database session

    Returns:
        IncentiveBreakdown with complete incentive details
    """
    # Get all sales for this period
    entries = get_sales_for_period(db, str(officer.id), month, year)

    # Calculate total units
    total_units = sum(entry.units_sold for entry in entries)

    # Calculate incentive
    matched_slab, total_payout, next_slab, units_to_next_slab = calculate_incentive(
        db, total_units
    )

    # Build per-model breakdown
    per_model_breakdown = []
    for entry in entries:
        car_model = (
            db.query(CarModel).filter(CarModel.id == entry.car_model_id).first()
        )
        if car_model:
            per_model_breakdown.append(
                PerModelBreakdown(
                    car_model_name=car_model.name,
                    units_sold=entry.units_sold,
                )
            )

    return IncentiveBreakdown(
        total_units_sold=total_units,
        matched_slab=SlabRuleResponse.model_validate(matched_slab)
        if matched_slab
        else None,
        total_payout=total_payout,
        next_slab=SlabRuleResponse.model_validate(next_slab) if next_slab else None,
        units_to_next_slab=units_to_next_slab,
        per_model_breakdown=per_model_breakdown,
    )


# ==================== History Endpoint ====================
class MonthlySummary:
    """Monthly summary data"""

    def __init__(
        self, month: int, year: int, total_units: int, total_payout: Decimal
    ):
        self.month = month
        self.year = year
        self.total_units = total_units
        self.total_payout = total_payout


@router.get("/history")
async def get_sales_history(
    officer: User = Depends(require_officer), db: Session = Depends(get_db)
):
    """
    Get monthly sales summary for the last 12 months.

    Shows total units and total payout per month.

    Args:
        officer: Officer user (validated by require_officer dependency)
        db: Database session

    Returns:
        List of monthly summaries with month, year, total_units, total_payout
    """
    # Calculate date range for last 12 months
    today = datetime.now()
    start_date = today - timedelta(days=365)

    # Query sales for last 12 months
    entries = (
        db.query(SalesEntry)
        .filter(
            and_(
                SalesEntry.officer_id == officer.id,
                SalesEntry.created_at >= start_date,
            )
        )
        .all()
    )

    # Group by month/year and calculate totals
    monthly_data = {}
    for entry in entries:
        key = (entry.month, entry.year)
        if key not in monthly_data:
            monthly_data[key] = {"total_units": 0, "total_payout": Decimal("0.00")}
        monthly_data[key]["total_units"] += entry.units_sold

    # Calculate payouts for each month
    result = []
    for (month, year), data in sorted(
        monthly_data.items(), key=lambda x: (x[0][1], x[0][0])
    ):
        _, payout, _, _ = calculate_incentive(db, data["total_units"])
        result.append(
            {
                "month": month,
                "year": year,
                "total_units": data["total_units"],
                "total_payout": str(payout),
            }
        )

    return result
