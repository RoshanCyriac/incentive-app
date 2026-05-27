import pytest
from httpx import AsyncClient
from decimal import Decimal
import uuid


# ==================== Auth Tests ====================

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, admin_user):
    """Test successful login"""
    response = await client.post(
        "/auth/login",
        json={"email": "admin@test.com", "password": "admin123"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user_role"] == "admin"
    assert data["user_name"] == "Admin User"


@pytest.mark.asyncio
async def test_login_wrong_email(client: AsyncClient):
    """Test login with non-existent email"""
    response = await client.post(
        "/auth/login",
        json={"email": "nonexistent@test.com", "password": "password"},
    )

    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, admin_user):
    """Test login with wrong password"""
    response = await client.post(
        "/auth/login",
        json={"email": "admin@test.com", "password": "wrongpassword"},
    )

    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, admin_token, admin_user):
    """Test get current user profile"""
    response = await client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@test.com"
    assert data["role"] == "admin"


# ==================== Car Model Tests ====================

@pytest.mark.asyncio
async def test_admin_get_cars(client: AsyncClient, admin_token, test_cars):
    """Test admin can get car models"""
    response = await client.get(
        "/admin/cars",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert data[0]["name"] == "Swift Dzire"


@pytest.mark.asyncio
async def test_admin_create_car(client: AsyncClient, admin_token):
    """Test admin can create car model"""
    response = await client.post(
        "/admin/cars",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Celerio",
            "base_suffix": "Base",
            "variant": "VXI",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Celerio"
    assert data["base_suffix"] == "Base"
    assert "id" in data


@pytest.mark.asyncio
async def test_officer_cannot_create_car(client: AsyncClient, officer_token):
    """Test officer cannot create car model"""
    response = await client.post(
        "/admin/cars",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "name": "Celerio",
            "base_suffix": "Base",
            "variant": "VXI",
        },
    )

    assert response.status_code == 403
    assert "Admin access required" in response.json()["detail"]


# ==================== Slab Rule Tests ====================

@pytest.mark.asyncio
async def test_admin_create_slab(client: AsyncClient, admin_token):
    """Test admin can create slab"""
    response = await client.post(
        "/admin/slabs",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "min_qty": 1,
            "max_qty": 3,
            "incentive_per_car": 1000,
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["min_qty"] == 1
    assert data["max_qty"] == 3
    assert float(data["incentive_per_car"]) == 1000


@pytest.mark.asyncio
async def test_create_slab_overlap(client: AsyncClient, admin_token, db_session):
    """Test that overlapping slabs are rejected"""
    # Create first slab
    response1 = await client.post(
        "/admin/slabs",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "min_qty": 1,
            "max_qty": 5,
            "incentive_per_car": 1000,
        },
    )
    assert response1.status_code == 201

    # Try to create overlapping slab
    response2 = await client.post(
        "/admin/slabs",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "min_qty": 4,
            "max_qty": 8,
            "incentive_per_car": 2000,
        },
    )

    assert response2.status_code == 400
    assert "overlaps" in response2.json()["detail"].lower()


@pytest.mark.asyncio
async def test_get_slabs_ordered(client: AsyncClient, admin_token):
    """Test slabs are returned ordered by min_qty"""
    # Create slabs in random order
    await client.post(
        "/admin/slabs",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"min_qty": 8, "max_qty": None, "incentive_per_car": 3500},
    )
    await client.post(
        "/admin/slabs",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"min_qty": 1, "max_qty": 3, "incentive_per_car": 1000},
    )
    await client.post(
        "/admin/slabs",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"min_qty": 4, "max_qty": 7, "incentive_per_car": 2000},
    )

    response = await client.get(
        "/admin/slabs",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data[0]["min_qty"] == 1
    assert data[1]["min_qty"] == 4
    assert data[2]["min_qty"] == 8


# ==================== Sales Entry Tests ====================

@pytest.mark.asyncio
async def test_officer_create_sales_entry(
    client: AsyncClient, officer_token, test_cars
):
    """Test officer can create sales entry"""
    response = await client.post(
        "/officer/sales",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "car_model_id": str(test_cars[0].id),
            "month": 5,
            "year": 2026,
            "units_sold": 3,
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["units_sold"] == 3
    assert data["month"] == 5


@pytest.mark.asyncio
async def test_upsert_sales_creates_new(
    client: AsyncClient, officer_token, test_cars
):
    """Test upsert creates new entry"""
    response = await client.post(
        "/officer/sales",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "car_model_id": str(test_cars[0].id),
            "month": 5,
            "year": 2026,
            "units_sold": 3,
        },
    )

    assert response.status_code == 201
    assert response.json()["units_sold"] == 3


@pytest.mark.asyncio
async def test_upsert_sales_updates_existing(
    client: AsyncClient, officer_token, test_cars
):
    """Test upsert updates existing entry instead of duplicating"""
    # Create first entry
    response1 = await client.post(
        "/officer/sales",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "car_model_id": str(test_cars[0].id),
            "month": 5,
            "year": 2026,
            "units_sold": 3,
        },
    )
    assert response1.status_code == 201

    # Update same entry
    response2 = await client.post(
        "/officer/sales",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "car_model_id": str(test_cars[0].id),
            "month": 5,
            "year": 2026,
            "units_sold": 5,
        },
    )
    assert response2.status_code == 201

    # Get sales for month - should have only 1 entry
    response3 = await client.get(
        "/officer/sales",
        params={"month": 5, "year": 2026},
        headers={"Authorization": f"Bearer {officer_token}"},
    )
    assert response3.status_code == 200
    data = response3.json()
    assert len(data) == 1
    assert data[0]["units_sold"] == 5


# ==================== Incentive Calculation Tests ====================

@pytest.mark.asyncio
async def test_incentive_calculation(
    client: AsyncClient, admin_token, officer_token, officer_user, test_cars
):
    """Test incentive calculation with slabs"""
    # Create slabs: 1-3=1000, 4-7=2000, 8+=3500

    # Create slabs (using admin token)
    await client.post(
        "/admin/slabs",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"min_qty": 1, "max_qty": 3, "incentive_per_car": 1000},
    )
    await client.post(
        "/admin/slabs",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"min_qty": 4, "max_qty": 7, "incentive_per_car": 2000},
    )
    await client.post(
        "/admin/slabs",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"min_qty": 8, "max_qty": None, "incentive_per_car": 3500},
    )

    # Officer enters 5 units
    await client.post(
        "/officer/sales",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "car_model_id": str(test_cars[0].id),
            "month": 5,
            "year": 2026,
            "units_sold": 5,
        },
    )

    # Get incentive
    response = await client.get(
        "/officer/incentive",
        params={"month": 5, "year": 2026},
        headers={"Authorization": f"Bearer {officer_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total_units_sold"] == 5
    assert float(data["total_payout"]) == 10000  # 5 * 2000
    assert data["matched_slab"]["min_qty"] == 4
    assert data["matched_slab"]["max_qty"] == 7


@pytest.mark.asyncio
async def test_incentive_no_slab_matched(client: AsyncClient, officer_token, test_cars):
    """Test incentive when no slab matches"""
    response = await client.get(
        "/officer/incentive",
        params={"month": 5, "year": 2026},
        headers={"Authorization": f"Bearer {officer_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total_units_sold"] == 0
    assert float(data["total_payout"]) == 0
    assert data["matched_slab"] is None


@pytest.mark.asyncio
async def test_incentive_with_multiple_models(
    client: AsyncClient, admin_token, officer_token, test_cars
):
    """Test incentive calculation with sales from multiple models"""

    # Create slab
    await client.post(
        "/admin/slabs",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"min_qty": 1, "max_qty": 3, "incentive_per_car": 1000},
    )

    # Enter sales for multiple models
    await client.post(
        "/officer/sales",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "car_model_id": str(test_cars[0].id),
            "month": 5,
            "year": 2026,
            "units_sold": 2,
        },
    )
    await client.post(
        "/officer/sales",
        headers={"Authorization": f"Bearer {officer_token}"},
        json={
            "car_model_id": str(test_cars[1].id),
            "month": 5,
            "year": 2026,
            "units_sold": 1,
        },
    )

    # Get incentive
    response = await client.get(
        "/officer/incentive",
        params={"month": 5, "year": 2026},
        headers={"Authorization": f"Bearer {officer_token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total_units_sold"] == 3
    assert float(data["total_payout"]) == 3000  # 3 * 1000
    assert len(data["per_model_breakdown"]) == 2


# ==================== Authorization Tests ====================

@pytest.mark.asyncio
async def test_unauthorized_without_token(client: AsyncClient):
    """Test endpoints require authentication"""
    response = await client.get("/auth/me")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_invalid_token(client: AsyncClient):
    """Test invalid token is rejected"""
    response = await client.get(
        "/auth/me",
        headers={"Authorization": "Bearer invalid_token"},
    )
    assert response.status_code == 401


# ==================== User Creation Tests ====================

@pytest.mark.asyncio
async def test_admin_create_officer(client: AsyncClient, admin_token):
    """Test admin can create officer user"""
    response = await client.post(
        "/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "New Officer",
            "email": "newofficer@test.com",
            "password": "securepass123",
            "role": "officer",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Officer"
    assert data["email"] == "newofficer@test.com"
    assert data["role"] == "officer"


@pytest.mark.asyncio
async def test_create_officer_duplicate_email(
    client: AsyncClient, admin_token, officer_user
):
    """Test cannot create officer with duplicate email"""
    response = await client.post(
        "/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "name": "Another Officer",
            "email": "officer@test.com",  # Duplicate
            "password": "securepass123",
            "role": "officer",
        },
    )

    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()
