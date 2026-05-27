from datetime import datetime
from typing import List
import uuid

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Boolean,
    func,
    TypeDecorator,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


# Custom GUID type that works with both PostgreSQL and SQLite
class GUID(TypeDecorator):
    """Platform-independent GUID type."""
    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return str(value)
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(value)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        GUID(),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    # Relationships
    sales_entries: Mapped[List["SalesEntry"]] = relationship(
        back_populates="officer",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint("role IN ('admin', 'officer')", name="check_role"),
    )


class CarModel(Base):
    __tablename__ = "car_models"

    id: Mapped[str] = mapped_column(
        GUID(),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    base_suffix: Mapped[str | None] = mapped_column(String(50), nullable=True)
    variant: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    # Relationships
    sales_entries: Mapped[List["SalesEntry"]] = relationship(
        back_populates="car_model",
        cascade="all, delete-orphan",
    )


class SlabRule(Base):
    __tablename__ = "slab_rules"

    id: Mapped[str] = mapped_column(
        GUID(),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    min_qty: Mapped[int] = mapped_column(Integer, nullable=False)
    max_qty: Mapped[int | None] = mapped_column(Integer, nullable=True)
    incentive_per_car: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )


class SalesEntry(Base):
    __tablename__ = "sales_entries"

    id: Mapped[str] = mapped_column(
        GUID(),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    officer_id: Mapped[str] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    car_model_id: Mapped[str] = mapped_column(
        GUID(),
        ForeignKey("car_models.id", ondelete="CASCADE"),
        nullable=False,
    )
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    units_sold: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    officer: Mapped["User"] = relationship(back_populates="sales_entries")
    car_model: Mapped["CarModel"] = relationship(back_populates="sales_entries")

    __table_args__ = (
        UniqueConstraint(
            "officer_id",
            "car_model_id",
            "month",
            "year",
            name="unique_sales_entry",
        ),
    )
