from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from backend.app.database import get_db
from backend.app.models.repo import Repository
from backend.app.models.analysis import Analysis
from backend.app.schemas.analysis import RepoResponse, AnalysisResponse
from backend.app.utils.logger import logger

router = APIRouter()


@router.get("/repos", response_model=List[RepoResponse])
async def list_repositories(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve previously analyzed repositories with their analysis history."""
    try:
        stmt = (
            select(Repository)
            .options(
                selectinload(Repository.analyses).selectinload(Analysis.recommendations)
            )
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        repos = result.scalars().all()

        response = []
        for r in repos:
            sorted_analyses = sorted(r.analyses, key=lambda a: a.created_at, reverse=True)
            response.append({
                "id": r.id,
                "url": r.url,
                "name": r.name,
                "owner": r.owner,
                "language": r.language,
                "last_analyzed_at": r.last_analyzed_at,
                "history": sorted_analyses
            })

        return response
    except Exception as e:
        logger.error(f"Database query failed in list_repositories: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load repository history: {str(e)}")


@router.get("/repos/{repo_id}", response_model=RepoResponse)
async def get_repository(
    repo_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve repository details and its analysis history."""
    stmt = (
        select(Repository)
        .where(Repository.id == repo_id)
        .options(
            selectinload(Repository.analyses).selectinload(Analysis.recommendations)
        )
    )
    result = await db.execute(stmt)
    repo = result.scalar_one_or_none()
    
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    # Order analyses by creation date descending
    repo.analyses.sort(key=lambda a: a.created_at, reverse=True)
    return {
        "id": repo.id,
        "url": repo.url,
        "name": repo.name,
        "owner": repo.owner,
        "language": repo.language,
        "last_analyzed_at": repo.last_analyzed_at,
        "history": repo.analyses
    }


@router.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
async def get_analysis_detail(
    analysis_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve detailed single analysis, including score breakdown and recommendations."""
    stmt = (
        select(Analysis)
        .where(Analysis.id == analysis_id)
        .options(
            selectinload(Analysis.details),
            selectinload(Analysis.recommendations)
        )
    )
    result = await db.execute(stmt)
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    # Format the detail columns back into the JSON structure expected by frontend
    # Since DB details are flat, reconstruct the 'layers' schema
    layers = {
        "code": {"carbon": analysis.code_carbon, "breakdown": {}},
        "ci": {"carbon": analysis.ci_carbon, "breakdown": {}},
        "infra": {"carbon": analysis.infra_carbon, "breakdown": {}}
    }
    
    for d in analysis.details:
        layer = d.layer
        category = d.category
        if layer in layers:
            if category not in layers[layer]["breakdown"]:
                layers[layer]["breakdown"][category] = {}
            layers[layer]["breakdown"][category][d.metric_name] = d.value

    # Reconstruct risks
    risks = []
    # If any specific detail violates risk thresholds, we re-verify or retrieve it
    # For simplicity, we can load stored detail parameters
    # Let's search if detail contains any high values
    for d in analysis.details:
        if d.metric_name == "nested_loops" and d.value >= 3:
            risks.append({
                "layer": "code",
                "severity": "HIGH",
                "message": f"Detected {int(d.value)} nested loops, indicating potential performance/carbon inefficiencies."
            })
        if d.metric_name == "n_plus_one_queries" and d.value >= 1:
            risks.append({
                "layer": "code",
                "severity": "HIGH",
                "message": f"Detected {int(d.value)} potential database N+1 query patterns."
            })
        if d.metric_name == "missing_caching" and d.value == 1:
            risks.append({
                "layer": "ci",
                "severity": "MEDIUM",
                "message": "CI workflows do not utilize package dependency caching."
            })

    # Prepare response object
    response_data = {
        "id": analysis.id,
        "repo_id": analysis.repo_id,
        "total_score": analysis.total_score,
        "code_carbon": analysis.code_carbon,
        "ci_carbon": analysis.ci_carbon,
        "infra_carbon": analysis.infra_carbon,
        "created_at": analysis.created_at,
        "layers": layers,
        "risks": risks,
        "recommendations": analysis.recommendations
    }

    return response_data
