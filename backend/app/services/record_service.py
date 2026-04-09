"""
礼金记录服务层 - 业务逻辑
"""
from datetime import datetime
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.schemas import (
    GiftRecordCreate,
    GiftRecordUpdate,
    GiftRecordResponse,
    StatisticsResponse,
)


def _doc_to_record(doc: dict) -> GiftRecordResponse:
    """将 MongoDB 文档转换为 GiftRecordResponse"""
    created_at = doc["created_at"]
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()
    deleted_at = doc.get("deleted_at")
    if isinstance(deleted_at, datetime):
        deleted_at = deleted_at.isoformat()
    return GiftRecordResponse(
        id=str(doc["_id"]),
        banquet_id=str(doc["banquet_id"]),
        guest_name=doc["guest_name"],
        amount=doc["amount"],
        gifts=doc.get("gifts", []),
        note=doc.get("note", ""),
        created_at=created_at,
        deleted_at=deleted_at,
    )


class RecordService:
    """礼金记录服务"""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.gift_records

    async def list_by_banquet(self, banquet_id: str, user_id: str) -> list[GiftRecordResponse]:
        """获取宴会的所有记录"""
        if not ObjectId.is_valid(banquet_id):
            return []
        # 先验证宴会属于该用户
        banquet = await self.collection.database.banquets.find_one(
            {"_id": ObjectId(banquet_id), "deleted_at": None, "user_id": user_id}
        )
        if not banquet:
            return []
        cursor = self.collection.find(
            {"banquet_id": ObjectId(banquet_id), "deleted_at": None}
        ).sort("created_at", -1)
        docs = await cursor.to_list(length=10000)
        return [_doc_to_record(doc) for doc in docs]

    async def get(self, record_id: str, user_id: str) -> Optional[GiftRecordResponse]:
        """获取单条记录"""
        if not ObjectId.is_valid(record_id):
            return None
        doc = await self.collection.find_one(
            {"_id": ObjectId(record_id), "deleted_at": None}
        )
        # 验证关联的宴会属于该用户
        if doc:
            banquet = await self.collection.database.banquets.find_one(
                {"_id": doc["banquet_id"], "deleted_at": None, "user_id": user_id}
            )
            if not banquet:
                return None
        return _doc_to_record(doc) if doc else None

    async def create(
        self, banquet_id: str, data: GiftRecordCreate, user_id: str
    ) -> GiftRecordResponse:
        """创建记录"""
        # 验证宴会属于该用户
        banquet = await self.collection.database.banquets.find_one(
            {"_id": ObjectId(banquet_id), "deleted_at": None, "user_id": user_id}
        )
        if not banquet:
            raise ValueError("宴会不存在")
        if banquet.get("frozen"):
            raise ValueError("宴会已归档")

        doc = {
            "banquet_id": ObjectId(banquet_id),
            "guest_name": data.guest_name,
            "amount": data.amount,
            "gifts": data.gifts,
            "note": data.note,
            "created_at": datetime.utcnow(),
        }
        result = await self.collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _doc_to_record(doc)

    async def update(
        self, record_id: str, data: GiftRecordUpdate, user_id: str
    ) -> Optional[GiftRecordResponse]:
        """更新记录"""
        if not ObjectId.is_valid(record_id):
            return None

        # 验证记录存在且属于该用户
        doc = await self.collection.find_one(
            {"_id": ObjectId(record_id), "deleted_at": None}
        )
        if not doc:
            return None
        banquet = await self.collection.database.banquets.find_one(
            {"_id": doc["banquet_id"], "deleted_at": None, "user_id": user_id}
        )
        if not banquet:
            return None
        if banquet.get("frozen"):
            raise ValueError("宴会已归档")

        update_data = {
            k: v for k, v in data.model_dump().items() if v is not None
        }
        if not update_data:
            return None

        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(record_id), "deleted_at": None},
            {"$set": update_data},
            return_document=True,
        )
        return _doc_to_record(result) if result else None

    async def delete(self, record_id: str, user_id: str) -> bool:
        """软删除记录"""
        if not ObjectId.is_valid(record_id):
            return False
        # 验证记录属于该用户
        doc = await self.collection.find_one(
            {"_id": ObjectId(record_id), "deleted_at": None}
        )
        if not doc:
            return False
        banquet = await self.collection.database.banquets.find_one(
            {"_id": doc["banquet_id"], "deleted_at": None, "user_id": user_id}
        )
        if not banquet:
            return False
        result = await self.collection.update_one(
            {"_id": ObjectId(record_id), "deleted_at": None},
            {"$set": {"deleted_at": datetime.utcnow()}},
        )
        return result.modified_count > 0

    async def delete_by_banquet(self, banquet_id: str, user_id: str) -> int:
        """软删除宴会的所有记录，返回删除数量"""
        if not ObjectId.is_valid(banquet_id):
            return 0
        # 验证宴会属于该用户
        banquet = await self.collection.database.banquets.find_one(
            {"_id": ObjectId(banquet_id), "deleted_at": None, "user_id": user_id}
        )
        if not banquet:
            return 0
        result = await self.collection.update_many(
            {"banquet_id": ObjectId(banquet_id), "deleted_at": None},
            {"$set": {"deleted_at": datetime.utcnow()}},
        )
        return result.modified_count

    async def get_banquet_id(self, record_id: str) -> Optional[str]:
        """获取记录所属宴会ID"""
        if not ObjectId.is_valid(record_id):
            return None
        doc = await self.collection.find_one(
            {"_id": ObjectId(record_id), "deleted_at": None}, {"banquet_id": 1}
        )
        return str(doc["banquet_id"]) if doc else None


class StatisticsService:
    """统计服务"""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.record_collection = db.gift_records

    async def get_banquet_stats(self, banquet_id: str, user_id: str) -> StatisticsResponse:
        """获取宴会统计数据"""
        if not ObjectId.is_valid(banquet_id):
            return StatisticsResponse(
                total_amount=0,
                guest_count=0,
                avg_amount=0,
                gift_types_count=0,
                top_guests=[],
                gift_stats=[],
            )

        # 验证宴会属于该用户
        banquet = await self.record_collection.database.banquets.find_one(
            {"_id": ObjectId(banquet_id), "deleted_at": None, "user_id": user_id}
        )
        if not banquet:
            return StatisticsResponse(
                total_amount=0,
                guest_count=0,
                avg_amount=0,
                gift_types_count=0,
                top_guests=[],
                gift_stats=[],
            )

        records = await self.record_collection.find(
            {"banquet_id": ObjectId(banquet_id), "deleted_at": None}
        ).to_list(length=10000)

        if not records:
            return StatisticsResponse(
                total_amount=0,
                guest_count=0,
                avg_amount=0,
                gift_types_count=0,
                top_guests=[],
                gift_stats=[],
            )

        # 计算统计
        total_amount = sum(r["amount"] for r in records)
        guest_count = len(records)
        avg_amount = total_amount // guest_count if guest_count > 0 else 0

        # 礼品统计
        gift_counts: dict[str, int] = {}
        for r in records:
            for gift in r.get("gifts", []):
                gift_counts[gift] = gift_counts.get(gift, 0) + 1

        gift_stats = sorted(
            [{"gift": k, "count": v} for k, v in gift_counts.items()],
            key=lambda x: x["count"],
            reverse=True,
        )[:5]

        # 礼金排行
        top_guests = sorted(
            [{"guest_name": r["guest_name"], "amount": r["amount"]} for r in records],
            key=lambda x: x["amount"],
            reverse=True,
        )[:5]

        return StatisticsResponse(
            total_amount=total_amount,
            guest_count=guest_count,
            avg_amount=avg_amount,
            gift_types_count=len(gift_counts),
            top_guests=top_guests,
            gift_stats=gift_stats,
        )
