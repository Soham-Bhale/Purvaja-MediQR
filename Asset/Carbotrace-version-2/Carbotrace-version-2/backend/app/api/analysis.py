from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime

from backend.app.database import get_db
from backend.app.models.repo import Repository
from backend.app.models.analysis import Analysis, AnalysisDetail
from backend.app.models.recommendation import Recommendation
from backend.app.schemas.analysis import AnalyzeRepoRequest, AnalysisResponse
from backend.app.services.github_client import clone_repository, cleanup_cloned_repo, parse_github_url
from backend.app.services.scoring_engine import calculate_master_score
from backend.app.services.llm_service import generate_recommendations

router = APIRouter()


@router.post("/analyze-repo", response_model=AnalysisResponse)
async def analyze_repo(
    request: AnalyzeRepoRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Clone, analyze, score, and generate LLM recommendations for a GitHub repository."""
    repo_url = request.repo_url.strip()
    
    try:
        owner, repo_name = parse_github_url(repo_url)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
        
    # 1. Clone repository to local temp dir
    try:
        temp_dir = await clone_repository(repo_url, branch=request.branch, github_token=request.github_token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloning failed: {e}")
        
    # 2. Run analysis
    try:
        analysis_data = await calculate_master_score(db, temp_dir)
        
        # 3. Generate LLM recommendations
        recommendations_data = []
        if request.include_llm:
            recommendations_data = await generate_recommendations(analysis_data)
    except Exception as e:
        cleanup_cloned_repo(temp_dir)
        raise HTTPException(status_code=500, detail=f"Scoring/analysis failed: {e}")
    finally:
        # 4. Schedule clean up in background tasks to ensure it deletes after we are done
        background_tasks.add_task(cleanup_cloned_repo, temp_dir)

    # 5. Insert/Update Repository in DB
    stmt = select(Repository).where(Repository.url == repo_url)
    result = await db.execute(stmt)
    db_repo = result.scalar_one_or_none()
    
    if not db_repo:
        # Approximate main language from dependencies
        lang = "Unknown"
        reg = analysis_data["layers"]["code"]["breakdown"]["dependencies"]["registry"]
        if reg == "npm":
            lang = "JavaScript"
        elif reg == "pypi":
            lang = "Python"
        elif reg == "maven":
            lang = "Java"
            
        db_repo = Repository(
            url=repo_url,
            name=repo_name,
            owner=owner,
            language=lang,
            last_analyzed_at=datetime.utcnow()
        )
        db.add(db_repo)
        await db.flush()
    else:
        db_repo.last_analyzed_at = datetime.utcnow()
        db.add(db_repo)
        await db.flush()

    # 6. Save Analysis
    db_analysis = Analysis(
        repo_id=db_repo.id,
        total_score=analysis_data["total_score"],
        code_carbon=analysis_data["code_carbon"],
        ci_carbon=analysis_data["ci_carbon"],
        infra_carbon=analysis_data["infra_carbon"],
        created_at=datetime.utcnow()
    )
    db.add(db_analysis)
    await db.flush()

    # 7. Save Analysis Details (Flat structure)
    for layer_name, layer_val in analysis_data["layers"].items():
        carbon = layer_val["carbon"]
        breakdown = layer_val["breakdown"]
        
        # Save total carbon for this layer
        db.add(AnalysisDetail(
            analysis_id=db_analysis.id,
            layer=layer_name,
            category="total",
            metric_name="emissions",
            value=carbon,
            unit="g CO2e"
        ))
        
        # Save granular breakdown stats
        if layer_name == "code":
            # Dependencies details
            deps = breakdown["dependencies"]
            db.add(AnalysisDetail(
                analysis_id=db_analysis.id,
                layer="code",
                category="dependencies",
                metric_name="num_dependencies",
                value=float(deps["num_dependencies"]),
                unit="count"
            ))
            db.add(AnalysisDetail(
                analysis_id=db_analysis.id,
                layer="code",
                category="dependencies",
                metric_name="size_mb",
                value=float(deps["size_mb"]),
                unit="MB"
            ))
            
            # AST details
            ast = breakdown["ast_patterns"]
            db.add(AnalysisDetail(
                analysis_id=db_analysis.id,
                layer="code",
                category="ast_patterns",
                metric_name="files_scanned",
                value=float(ast["files_scanned"]),
                unit="count"
            ))
            db.add(AnalysisDetail(
                analysis_id=db_analysis.id,
                layer="code",
                category="ast_patterns",
                metric_name="nested_loops",
                value=float(ast["nested_loops"]),
                unit="count"
            ))
            db.add(AnalysisDetail(
                analysis_id=db_analysis.id,
                layer="code",
                category="ast_patterns",
                metric_name="n_plus_one_queries",
                value=float(ast["n_plus_one_queries"]),
                unit="count"
            ))
            db.add(AnalysisDetail(
                analysis_id=db_analysis.id,
                layer="code",
                category="ast_patterns",
                metric_name="unused_imports",
                value=float(ast["unused_imports"]),
                unit="count"
            ))
            
            # CodeCarbon physical measured emissions if overlay exists
            overlay = breakdown["codecarbon_physical"]
            if overlay:
                db.add(AnalysisDetail(
                    analysis_id=db_analysis.id,
                    layer="code",
                    category="codecarbon",
                    metric_name="measured_emissions",
                    value=float(overlay["emissions_g"]),
                    unit="g CO2e"
                ))

        elif layer_name == "ci":
            ci = breakdown
            db.add(AnalysisDetail(
                analysis_id=db_analysis.id,
                layer="ci",
                category="workflows",
                metric_name="num_workflows",
                value=float(ci["num_workflows"]),
                unit="count"
            ))
            db.add(AnalysisDetail(
                analysis_id=db_analysis.id,
                layer="ci",
                category="workflows",
                metric_name="missing_caching",
                value=float(ci["missing_caching"]),
                unit="binary"
            ))

        elif layer_name == "infra":
            infra = breakdown
            db.add(AnalysisDetail(
                analysis_id=db_analysis.id,
                layer="infra",
                category="instances",
                metric_name="num_instances",
                value=float(infra["num_instances"]),
                unit="count"
            ))

    # 8. Save Recommendations
    recommendations = []
    for rec in recommendations_data:
        db_rec = Recommendation(
            analysis_id=db_analysis.id,
            issue=rec["issue"],
            description=rec["description"],
            savings_percent=rec["savings_percent"],
            effort=rec["effort"],
            priority=rec["priority"],
            source=rec.get("source", "static_rules"),
        )
        db.add(db_rec)
        recommendations.append(db_rec)

    await db.commit()

    # Reconstruct final response
    return {
        "id": db_analysis.id,
        "repo_id": db_repo.id,
        "total_score": db_analysis.total_score,
        "code_carbon": db_analysis.code_carbon,
        "ci_carbon": db_analysis.ci_carbon,
        "infra_carbon": db_analysis.infra_carbon,
        "created_at": db_analysis.created_at,
        "layers": {
            "code": {"carbon": db_analysis.code_carbon, "breakdown": analysis_data["layers"]["code"]["breakdown"]},
            "ci": {"carbon": db_analysis.ci_carbon, "breakdown": analysis_data["layers"]["ci"]["breakdown"]},
            "infra": {"carbon": db_analysis.infra_carbon, "breakdown": analysis_data["layers"]["infra"]["breakdown"]}
        },
        "risks": analysis_data["risks"],
        "recommendations": [
            {
                "issue": r.issue,
                "description": r.description,
                "savings_percent": r.savings_percent,
                "effort": r.effort,
                "priority": r.priority,
                "source": r.source,
            } for r in recommendations
        ]
    }
