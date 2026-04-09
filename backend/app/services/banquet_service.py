"""
宴会服务层 - 业务逻辑
"""
from datetime import datetime
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.schemas import BanquetCreate, BanquetUpdate, BanquetResponse


def doc_to_banquet(doc: dict) -> BanquetResponse:
    """将 MongoDB 文档转换为 BanquetResponse"""
    created_at = doc["created_at"]
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()
    deleted_at = doc.get("deleted_at")
    if isinstance(deleted_at, datetime):
        deleted_at = deleted_at.isoformat()
    return BanquetResponse(
        id=str(doc["_id"]),
        name=doc["name"],
        date=doc["date"],
        location=doc.get("location", ""),
        type=doc["type"],
        frozen=doc.get("frozen", False),
        created_at=created_at,
        deleted_at=deleted_at,
    )


class BanquetService:
    """宴会服务"""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.banquets

    async def list(self, user_id: str) -> list[BanquetResponse]:
        """获取用户的所有宴会"""
        cursor = self.collection.find({"deleted_at": None, "user_id": user_id}).sort("created_at", -1)
        docs = await cursor.to_list(length=1000)
        return [doc_to_banquet(doc) for doc in docs]

    async def get(self, banquet_id: str, user_id: str) -> Optional[BanquetResponse]:
        """获取单个宴会"""
        if not ObjectId.is_valid(banquet_id):
            return None
        doc = await self.collection.find_one(
            {"_id": ObjectId(banquet_id), "deleted_at": None, "user_id": user_id}
        )
        return doc_to_banquet(doc) if doc else None

    async def create(self, data: BanquetCreate, user_id: str) -> BanquetResponse:
        """创建宴会"""
        doc = {
            "name": data.name,
            "date": data.date,
            "location": data.location,
            "type": data.type,
            "frozen": False,
            "created_at": datetime.utcnow(),
            "user_id": user_id,
        }
        result = await self.collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc_to_banquet(doc)

    async def update(
        self, banquet_id: str, data: BanquetUpdate, user_id: str
    ) -> Optional[BanquetResponse]:
        """更新宴会"""
        if not ObjectId.is_valid(banquet_id):
            return None

        update_data = {
            k: v for k, v in data.model_dump().items() if v is not None
        }
        if not update_data:
            return None

        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(banquet_id), "deleted_at": None, "user_id": user_id},
            {"$set": update_data},
            return_document=True,
        )
        return doc_to_banquet(result) if result else None

    async def delete(self, banquet_id: str, user_id: str) -> bool:
        """软删除宴会"""
        if not ObjectId.is_valid(banquet_id):
            return False
        result = await self.collection.update_one(
            {"_id": ObjectId(banquet_id), "deleted_at": None, "user_id": user_id},
            {"$set": {"deleted_at": datetime.utcnow()}},
        )
        return result.modified_count > 0

    async def freeze(self, banquet_id: str, user_id: str) -> Optional[BanquetResponse]:
        """归档宴会"""
        if not ObjectId.is_valid(banquet_id):
            return None
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(banquet_id), "deleted_at": None, "user_id": user_id},
            {"$set": {"frozen": True}},
            return_document=True,
        )
        return doc_to_banquet(result) if result else None

    async def exists(self, banquet_id: str, user_id: str) -> bool:
        """检查宴会是否存在"""
        if not ObjectId.is_valid(banquet_id):
            return False
        doc = await self.collection.find_one(
            {"_id": ObjectId(banquet_id), "deleted_at": None, "user_id": user_id}
        )
        return doc is not None

    async def is_frozen(self, banquet_id: str, user_id: str) -> bool:
        """检查宴会是否已归档"""
        if not ObjectId.is_valid(banquet_id):
            return False
        doc = await self.collection.find_one(
            {"_id": ObjectId(banquet_id), "deleted_at": None, "user_id": user_id}, {"frozen": 1}
        )
        return doc.get("frozen", False) if doc else True
