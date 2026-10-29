from datetime import datetime
from sqlalchemy import Column, Integer, String, BigInteger, DateTime
from backend.app.database import Base


class PackageCache(Base):
    __tablename__ = "package_cache"

    id = Column(Integer, primary_key=True, index=True)
    registry = Column(String, nullable=False, index=True)      # e.g., "npm", "pypi"
    package_name = Column(String, nullable=False, index=True)
    version = Column(String, nullable=False)
    size_bytes = Column(BigInteger, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
