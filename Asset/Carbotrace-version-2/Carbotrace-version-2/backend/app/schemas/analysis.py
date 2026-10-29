from pydantic import BaseModel, HttpUrl, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


class AnalyzeRepoRequest(BaseModel):
    repo_url: str
    branch: Optional[str] = None
    include_infra: Optional[bool] = True
    include_llm: Optional[bool] = True
    github_token: Optional[str] = None


class GitHubAuthRequest(BaseModel):
    token: str


class GitHubUserResponse(BaseModel):
    login: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    html_url: Optional[str] = None
    public_repos: Optional[int] = 0
    total_private_repos: Optional[int] = 0


class GitHubRepoItem(BaseModel):
    id: int
    name: str
    full_name: str
    private: bool
    html_url: str
    description: Optional[str] = None
    language: Optional[str] = None
    default_branch: Optional[str] = "main"
    updated_at: Optional[str] = None



class RiskItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    layer: str
    severity: str
    message: str


class RecommendationItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    issue: str
    description: str
    savings_percent: float
    effort: str
    priority: str
    source: str  # ollama_local | ollama_cloud | static_rules


class LayerBreakdown(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    carbon: float
    breakdown: Dict[str, Any]


class LayersBreakdown(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    code: LayerBreakdown
    ci: LayerBreakdown
    infra: LayerBreakdown


class AnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    repo_id: int
    total_score: float
    code_carbon: float
    ci_carbon: float
    infra_carbon: float
    created_at: datetime
    layers: Optional[LayersBreakdown] = None
    risks: Optional[List[RiskItem]] = None
    recommendations: Optional[List[RecommendationItem]] = None


class RepoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    url: str
    name: str
    owner: str
    language: Optional[str] = None
    last_analyzed_at: datetime
    history: Optional[List[AnalysisResponse]] = None
