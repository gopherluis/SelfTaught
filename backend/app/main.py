
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.database import Base, engine
import app.models  # Ensures all models are loaded


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on application startup.
    try:
        Base.metadata.create_all(bind=engine)
        print("DATABASE STARTUP: Tables initialized successfully.")
    except Exception:
        print("DATABASE STARTUP ERROR: Failed to initialize database.")
        raise

    yield


# Initialize FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Plataforma de Organização de Estudos e Aprendizagem Autodidata",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"UNHANDLED ERROR: {type(exc).__name__}: {exc}")

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Ocorreu um erro interno no servidor."
        },
    )


# API healthcheck
@app.get("/api/health", tags=["Sistema"])
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
    }


# Database healthcheck
@app.get("/api/health/database", tags=["Sistema"])
def database_health():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))

            return {
                "database": "connected",
                "query_result": result.scalar(),
            }

    except Exception as exc:
        print(
            f"DATABASE CONNECTION ERROR: "
            f"{type(exc).__name__}: {exc}"
        )

        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "database": "disconnected",
                "detail": "Database connection failed.",
            },
        )


# Register API V1 routers
app.include_router(
    api_router,
    prefix=settings.API_V1_STR,
)
