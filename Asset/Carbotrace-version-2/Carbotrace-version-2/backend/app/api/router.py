from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.database import get_db
from backend.app.api.repos import router as repos_router
from backend.app.api.analysis import router as analysis_router
from backend.app.api.github import router as github_router

api_router = APIRouter()

# Include sub-routers
api_router.include_router(analysis_router, prefix="", tags=["analysis"])
api_router.include_router(repos_router, prefix="", tags=["repositories"])
api_router.include_router(github_router, prefix="", tags=["github"])


@api_router.get("/health", tags=["health"])
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check endpoint to verify database connectivity."""
    try:
        # Simple query to check DB connection
        await db.execute(select(1))
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": f"error: {str(e)}"
        }
