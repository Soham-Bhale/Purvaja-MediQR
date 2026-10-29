from contextlib import asynccontextmanager
import shutil
import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.config import settings
from backend.app.database import get_db, async_engine
from backend.app.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    logger.info("Starting up Carbotrace backend...")
    # Ensure temp clone directory is clean
    if os.path.exists(settings.TEMP_CLONE_DIR):
        logger.info(f"Cleaning up temp clone directory: {settings.TEMP_CLONE_DIR}")
        shutil.rmtree(settings.TEMP_CLONE_DIR, ignore_errors=True)
    os.makedirs(settings.TEMP_CLONE_DIR, exist_ok=True)
    
    yield
    
    # Shutdown tasks
    logger.info("Shutting down Carbotrace backend...")
    # Clean up temp files
    if os.path.exists(settings.TEMP_CLONE_DIR):
        logger.info(f"Cleaning up temp clone directory: {settings.TEMP_CLONE_DIR}")
        shutil.rmtree(settings.TEMP_CLONE_DIR, ignore_errors=True)
    
    # Close SQLAlchemy engine pool
    await async_engine.dispose()
    logger.info("Database connection pool disposed.")


from backend.app.api.router import api_router

app = FastAPI(
    title=settings.APP_NAME,
    description="Carbon-Aware Software Analytics Dashboard Backend",
    version="0.1.0",
    lifespan=lifespan
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8001",
    ],
    allow_origin_regex=r"http://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
@app.get("/api")
async def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }

