import os
import sys
from datetime import datetime, timedelta
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import get_db
from models import User

# Load environment variables
load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

# Only require SECRET_KEY in production/non-testing environments
if not SECRET_KEY:
    if "pytest" not in sys.modules:
        raise ValueError("SECRET_KEY environment variable is not set")
    # Use a default secret for testing
    SECRET_KEY = "test-secret-key-do-not-use-in-production"

# Password hashing context
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# HTTP Bearer security scheme
security = HTTPBearer()


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    Args:
        password: Plain text password

    Returns:
        Hashed password
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.

    Args:
        plain_password: Plain text password
        hashed_password: Hashed password from database

    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: dict, expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token.

    Args:
        data: Dictionary containing claims (typically {"sub": user_email})
        expires_delta: Optional custom expiration delta. If not provided,
                      uses ACCESS_TOKEN_EXPIRE_MINUTES from environment

    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency that extracts and validates the current user from JWT token.

    Args:
        credentials: Bearer token from Authorization header
        db: Database session

    Returns:
        User ORM object if valid, raises 401 if invalid or inactive

    Raises:
        HTTPException: 401 Unauthorized if token is invalid or user not found/inactive
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: Optional[str] = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Query user from database
    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive",
        )

    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    FastAPI dependency that ensures the current user is an admin.

    Args:
        current_user: Current authenticated user

    Returns:
        User ORM object if user is admin

    Raises:
        HTTPException: 403 Forbidden if user is not admin
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user


async def require_officer(current_user: User = Depends(get_current_user)) -> User:
    """
    FastAPI dependency that ensures the current user is an officer.

    Args:
        current_user: Current authenticated user

    Returns:
        User ORM object if user is officer

    Raises:
        HTTPException: 403 Forbidden if user is not officer
    """
    if current_user.role != "officer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Officer access required",
        )

    return current_user
