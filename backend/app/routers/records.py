"""
礼金记录路由
"""
from fastapi import APIRouter, HTTPException, status, Depends

from app.database import get_database
from app.models.schemas import (
    GiftRecordCreate,
    GiftRecordUpdate,
    GiftRecordResponse,
    StatisticsResponse,
)
from app.services.banquet_service import BanquetService
from app.services.record_service import RecordService, StatisticsService
from app.routers.auth import get_current_user

router = APIRouter(tags=["礼金记录"])


def _get_banquet_service() -> BanquetService:
    return BanquetService(get_database())


def _get_record_service() -> RecordService:
    return RecordService(get_database())


def _get_stats_service() -> StatisticsService:
    return StatisticsService(get_database())


@router.get(
    "/banquets/{banquet_id}/records",
    response_model=list[GiftRecordResponse],
)
async def list_records(banquet_id: str, current_user: dict = Depends(get_current_user)):
    """获取宴会下的所有记录"""
    service = _get_record_service()
    return await service.list_by_banquet(banquet_id, current_user["id"])


@router.post(
    "/banquets/{banquet_id}/records",
    response_model=GiftRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_record(banquet_id: str, data: GiftRecordCreate, current_user: dict = Depends(get_current_user)):
    """新增礼金记录"""
    service = _get_record_service()
    try:
        return await service.create(banquet_id, data, current_user["id"])
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/records/{record_id}", response_model=GiftRecordResponse)
async def update_record(record_id: str, data: GiftRecordUpdate, current_user: dict = Depends(get_current_user)):
    """更新记录"""
    record_service = _get_record_service()

    try:
        updated = await record_service.update(record_id, data, current_user["id"])
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="记录不存在",
            )
        return updated
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_record(record_id: str, current_user: dict = Depends(get_current_user)):
    """删除记录"""
    record_service = _get_record_service()

    result = await record_service.delete(record_id, current_user["id"])
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="记录不存在",
        )


@router.get(
    "/banquets/{banquet_id}/statistics",
    response_model=StatisticsResponse,
)
async def get_statistics(banquet_id: str, current_user: dict = Depends(get_current_user)):
    """获取宴会统计数据"""
    service = _get_stats_service()
    return await service.get_banquet_stats(banquet_id, current_user["id"])
