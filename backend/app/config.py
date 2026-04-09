"""
配置管理
"""
import secrets
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""

    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017"
    database_name: str = "renqing"

    # API
    api_title: str = "人情簿 API"
    api_version: str = "1.0.0"

    # JWT Secret
    secret_key: str = secrets.token_urlsafe(32)

    # 公开路由（无需登录）
    public_paths: list[str] = [
        "/api/auth/register",
        "/api/auth/login",
        "/health",
        "/docs",
        "/openapi.json",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
