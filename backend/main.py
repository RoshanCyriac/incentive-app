import logging
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

from database import check_db_connection
from routers.auth import router as auth_router
from routers.admin import router as admin_router
from routers.officer import router as officer_router

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Incentive Calculator API",
    version="1.0.0",
    description="Toyota incentive calculator for sales officers and administrators",
)

# ==================== CORS Configuration ====================
# Get allowed origins from environment
react_app_url = os.getenv("REACT_APP_API_URL", "http://localhost/api")
# Extract base URL (remove /api if present)
react_origin = react_app_url.replace("/api", "")

allowed_origins = [
    react_origin,
    "http://localhost:3000",
    "http://localhost",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Event Handlers ====================
@app.on_event("startup")
async def startup_event():
    """Log application startup"""
    logger.info("=" * 50)
    logger.info("Incentive Calculator API starting...")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"CORS allowed origins: {allowed_origins}")
    logger.info("=" * 50)


# ==================== Health Check Endpoint ====================
@app.get("/health")
async def health_check():
    """
    Health check endpoint that verifies API and database connectivity.

    Returns:
        JSON response with status, timestamp, and database status
    """
    db_connected = check_db_connection()

    return {
        "status": "healthy" if db_connected else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected" if db_connected else "disconnected",
        "service": "Incentive Calculator API",
        "version": "1.0.0",
    }


# ==================== Router Includes ====================
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(officer_router)


# ==================== Exception Handlers ====================
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handle 404 Not Found errors with clean JSON response"""
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not Found",
            "message": f"The requested endpoint {request.url.path} does not exist",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Handle 500 Internal Server Error with clean JSON response"""
    logger.error(f"Internal server error on {request.url.path}: {str(exc)}")

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred. Please try again later.",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with detailed JSON response"""
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "message": "Invalid request data",
            "details": exc.errors(),
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


# ==================== Root Endpoint ====================
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Incentive Calculator API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
