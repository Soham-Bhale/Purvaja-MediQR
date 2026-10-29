import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "Carbotrace"
    ENV: str = "development"
    DEBUG: bool = True

    # Database
    # Note: TimescaleDB is just PostgreSQL with an extension.
    # Default local dev values point to host "db" (for docker-compose) or "localhost" (for local running)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/carbotrace"
    SYNC_DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/carbotrace"

    # External integrations
    GITHUB_TOKEN: Optional[str] = None
    ELECTRICITY_MAPS_API_KEY: Optional[str] = None
    
    # LLM Settings
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5-coder:3b"
    OLLAMA_API_KEY: Optional[str] = None
    # Local Ollama fallback (tried first, before cloud)
    OLLAMA_LOCAL_HOST: str = "http://localhost:11434"
    OLLAMA_LOCAL_MODEL: str = "qwen2.5-coder:3b"

    # AWS configuration for Cost Explorer
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_DEFAULT_REGION: str = "us-east-1"

    # Temporary directory for cloning repositories
    # Needs to be inside the workspace, e.g. under the backend directory
    TEMP_CLONE_DIR: str = str(Path(__file__).parent.parent / "temp_repos")

    # API configuration
    API_V1_STR: str = "/api"

    model_config = SettingsConfigDict(
        env_file=(".env.local", ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Ensure temp clone directory exists
os.makedirs(settings.TEMP_CLONE_DIR, exist_ok=True)
