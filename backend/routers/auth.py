from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import create_access_token, get_current_user, verify_password
from database import get_db
from models import User
from schemas import LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    User login endpoint.

    Accepts email and password, validates credentials, and returns JWT access token.

    Args:
        request: LoginRequest containing email and password
        db: Database session

    Returns:
        TokenResponse with access token, token type, user role, and name

    Raises:
        HTTPException: 401 Unauthorized if user not found or password incorrect
    """
    # Query user by email
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
        )

    # Create access token
    access_token = create_access_token(data={"sub": user.email})

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_role=user.role,
        user_name=user.name,
    )


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user profile.

    Requires valid JWT token in Authorization header.

    Args:
        current_user: Current authenticated user from JWT token

    Returns:
        UserResponse with user profile (excluding password)
    """
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        is_active=current_user.is_active,
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    User logout endpoint.

    Since JWT is stateless, this endpoint simply returns a success message
    and instructs the frontend to clear the token from storage.

    Args:
        current_user: Current authenticated user (validates token is valid)

    Returns:
        Success message for frontend to clear token
    """
    return {
        "message": "Successfully logged out",
        "detail": "Please clear your authentication token from client storage",
    }
