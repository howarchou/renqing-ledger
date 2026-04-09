"""
宴会路由
"""
from fastapi import APIRouter, HTTPException, status, Depends

from app.database import get_database
from app.models.schemas import (
    BanquetCreate,
    BanquetUpdate,
    BanquetResponse,
)
from app.services.banquet_service import BanquetService
from app.services.record_service import RecordService
from app.routers.auth import get_current_user

router = APIRouter(prefix="/banquets", tags=["宴会"])


def _get_service() -> BanquetService:
    return BanquetService(get_database())


def _get_record_service() -> RecordService:
    return RecordService(get_database())


@router.get("", response_model=list[BanquetResponse])
async def list_banquets(current_user: dict = Depends(get_current_user)):
    """获取所有宴会列表"""
    service = _get_service()
    return await service.list(current_user["id"])


@router.get("/{banquet_id}", response_model=BanquetResponse)
async def get_banquet(banquet_id: str, current_user: dict = Depends(get_current_user)):
    """获取单个宴会详情"""
    service = _get_service()
    banquet = await service.get(banquet_id, current_user["id"])
    if not banquet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="宴会不存在",
        )
    return banquet


@router.post(
    "",
    response_model=BanquetResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_banquet(data: BanquetCreate, current_user: dict = Depends(get_current_user)):
    """创建宴会"""
    service = _get_service()
    return await service.create(data, current_user["id"])


@router.put("/{banquet_id}", response_model=BanquetResponse)
async def update_banquet(banquet_id: str, data: BanquetUpdate, current_user: dict = Depends(get_current_user)):
    """更新宴会信息"""
    service = _get_service()
    banquet = await service.update(banquet_id, data, current_user["id"])
    if not banquet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="宴会不存在",
        )
    return banquet


@router.delete("/{banquet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_banquet(banquet_id: str, current_user: dict = Depends(get_current_user)):
    """删除宴会（级联删除记录）"""
    service = _get_service()
    record_service = _get_record_service()

    if not await service.exists(banquet_id, current_user["id"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="宴会不存在",
        )

    await service.delete(banquet_id, current_user["id"])
    await record_service.delete_by_banquet(banquet_id, current_user["id"])


@router.post("/{banquet_id}/freeze", response_model=BanquetResponse)
async def freeze_banquet(banquet_id: str, current_user: dict = Depends(get_current_user)):
    """归档宴会"""
    service = _get_service()
    banquet = await service.freeze(banquet_id, current_user["id"])
    if not banquet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="宴会不存在",
        )
    return banquet
