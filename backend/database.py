import os
import sys
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import QueuePool

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Only require DATABASE_URL in production/non-testing environments
if not DATABASE_URL and "pytest" not in sys.modules:
    raise ValueError("DATABASE_URL environment variable is not set")

# Use a default URL if in testing mode
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///:memory:"

# Create SQLAlchemy engine with connection pool settings
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    echo=False,  # Set to True for SQL query logging
)

# Create SessionLocal using sessionmaker
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# Create Base class for declarative models
class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function that yields a database session.
    Ensures the session is properly closed after use.
    
    Usage in FastAPI:
        @app.get("/items/")
        def read_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """
    Tests database connectivity and returns True if connection is successful,
    False otherwise. Useful for health check endpoints.
    
    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False
