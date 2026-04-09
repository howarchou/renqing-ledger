"""
人情簿后端 API - FastAPI + MongoDB
入口文件
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import lifespan_manager
from app.routers import banquets_router, records_router, presets_router, auth_router

# 创建 FastAPI 应用
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    lifespan=lifespan_manager,
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth_router, prefix="/api")
app.include_router(banquets_router, prefix="/api")
app.include_router(records_router, prefix="/api")
app.include_router(presets_router, prefix="/api")


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "service": settings.api_title}


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "欢迎使用人情簿 API",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
