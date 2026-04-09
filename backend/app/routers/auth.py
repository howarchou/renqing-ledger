"""
认证路由
"""
from fastapi import APIRouter, HTTPException, status, Depends, Header
from typing import Optional

from app.models.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService, get_auth_service
from app.database import get_database

router = APIRouter(prefix="/auth", tags=["认证"])


async def get_current_user(
    authorization: Optional[str] = Header(None),
) -> dict:
    """获取当前用户（依赖项）"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="未登录",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 解析 Bearer Token
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证格式",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    auth_service = get_auth_service()
    user = await auth_service.get_user_from_token(token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token 无效或已过期",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: UserRegisterRequest):
    """用户注册"""
    service = get_auth_service()
    user = await service.register(data.username, data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在",
        )

    return {"message": "注册成功", "user": user}


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLoginRequest):
    """用户登录"""
    service = get_auth_service()
    result = await service.login(data.username, data.password)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
        )

    return result


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """获取当前用户信息"""
    return current_user