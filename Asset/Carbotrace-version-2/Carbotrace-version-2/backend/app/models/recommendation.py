from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False)
    issue = Column(String, nullable=False)
    description = Column(String, nullable=False)
    savings_percent = Column(Float, nullable=False)
    effort = Column(String, nullable=False)      # e.g., "LOW", "MEDIUM", "HIGH"
    priority = Column(String, nullable=False)    # e.g., "LOW", "MEDIUM", "HIGH"
    source = Column(String, nullable=False, default="static_rules")  # ollama_local | ollama_cloud | static_rules

    # Relationships
    analysis = relationship("Analysis", back_populates="recommendations")
