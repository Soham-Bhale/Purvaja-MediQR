from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    repo_id = Column(Integer, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    total_score = Column(Float, nullable=False)
    code_carbon = Column(Float, nullable=False)  # g CO2e
    ci_carbon = Column(Float, nullable=False)    # g CO2e
    infra_carbon = Column(Float, nullable=False)   # g CO2e
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    repository = relationship("Repository", back_populates="analyses")
    details = relationship("AnalysisDetail", back_populates="analysis", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="analysis", cascade="all, delete-orphan")


class AnalysisDetail(Base):
    __tablename__ = "analysis_details"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    layer = Column(String, nullable=False)         # e.g., "code", "ci", "infra"
    category = Column(String, nullable=False)      # e.g., "dependencies", "patterns", "builds"
    metric_name = Column(String, nullable=False)   # e.g., "nested_loops", "pypi_size"
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=False)          # e.g., "g CO2e", "MB", "count"

    # Relationships
    analysis = relationship("Analysis", back_populates="details")
