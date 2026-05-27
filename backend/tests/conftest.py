import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import create_engine, UUID, String
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.types import TypeDecorator
import uuid
import sys

# Workaround for SQLite UUID support
class GUID(TypeDecorator):
    """Platform-independent GUID type."""
    impl = String
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
        return uuid.UUID(value)


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Setup test environment variables"""
    import os
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    os.environ["SECRET_KEY"] = "test-secret-key"


@pytest_asyncio.fixture
async def test_db():
    """Create an in-memory SQLite database for testing"""
    from main import app
    from database import Base, get_db

    # Use SQLite in-memory database
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )

    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Create session
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=engine
    )

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    yield engine

    # Cleanup
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


@pytest_asyncio.fixture
async def db_session(test_db):
    """Get a database session for tests"""
    from sqlalchemy.orm import sessionmaker
    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=test_db
    )
    db = TestingSessionLocal()
    yield db
    db.close()


@pytest_asyncio.fixture
async def client(test_db):
    """Create test client"""
    from main import app
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def admin_user(db_session):
    """Create test admin user"""
    from models import User
    from auth import hash_password
    
    # Bcrypt has a 72-byte limit, so we truncate passwords
    password = "admin123"[:72]
    admin = User(
        id=str(uuid.uuid4()),
        name="Admin User",
        email="admin@test.com",
        password_hash=hash_password(password),
        role="admin",
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest_asyncio.fixture
async def officer_user(db_session):
    """Create test officer user"""
    from models import User
    from auth import hash_password
    
    # Bcrypt has a 72-byte limit, so we truncate passwords
    password = "officer123"[:72]
    officer = User(
        id=str(uuid.uuid4()),
        name="Officer User",
        email="officer@test.com",
        password_hash=hash_password(password),
        role="officer",
    )
    db_session.add(officer)
    db_session.commit()
    db_session.refresh(officer)
    return officer


@pytest_asyncio.fixture
async def admin_token(admin_user):
    """Generate admin JWT token"""
    from auth import create_access_token
    return create_access_token({"sub": admin_user.email})


@pytest_asyncio.fixture
async def officer_token(officer_user):
    """Generate officer JWT token"""
    from auth import create_access_token
    return create_access_token({"sub": officer_user.email})


@pytest_asyncio.fixture
async def test_cars(db_session, admin_user):
    """Create test car models"""
    from models import CarModel
    
    cars = [
        CarModel(
            id=str(uuid.uuid4()),
            name="Swift Dzire",
            base_suffix="Base",
            variant="ZXI",
        ),
        CarModel(
            id=str(uuid.uuid4()),
            name="Ertiga",
            base_suffix="Base",
            variant="ZXI Plus",
        ),
        CarModel(
            id=str(uuid.uuid4()),
            name="Brezza",
            base_suffix="Base",
            variant="VXI",
        ),
    ]
    db_session.add_all(cars)
    db_session.commit()
    for car in cars:
        db_session.refresh(car)
    return cars


@pytest_asyncio.fixture
async def test_slabs(db_session):
    """Create test slab rules"""
    from models import SlabRule
    
    slabs = [
        SlabRule(
            id=str(uuid.uuid4()),
            min_qty=1,
            max_qty=3,
            incentive_per_car=1000,
        ),
        SlabRule(
            id=str(uuid.uuid4()),
            min_qty=4,
            max_qty=7,
            incentive_per_car=2000,
        ),
        SlabRule(
            id=str(uuid.uuid4()),
            min_qty=8,
            max_qty=None,
            incentive_per_car=3500,
        ),
    ]
    db_session.add_all(slabs)
    db_session.commit()
    for slab in slabs:
        db_session.refresh(slab)
    return slabs
