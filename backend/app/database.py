"""
MongoDB 数据库连接
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import AsyncGenerator
from typing import Optional

from app.config import settings


class Database:
    """数据库单例"""

    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None


db_instance = Database()


async def connect_to_mongo():
    """连接 MongoDB"""
    # 隐藏密码的 URI 用于显示
    uri_display = settings.mongodb_uri
    if '@' in uri_display:
        uri_display = uri_display.split('@')[0] + '@***'
    print(f"[MongoDB] 正在连接: {uri_display}")
    print(f"[MongoDB] 数据库名: {settings.database_name}")
    db_instance.client = AsyncIOMotorClient(settings.mongodb_uri)
    db_instance.db = db_instance.client[settings.database_name]
    print(f"[MongoDB] 连接到数据库: {settings.database_name}")

    # 测试连接
    try:
        await db_instance.client.admin.command('ping')
        print("[MongoDB] 连接成功")
    except Exception as e:
        print(f"[MongoDB] 连接失败: {e}")
        raise

    # 创建索引
    await db_instance.db.banquets.create_index("created_at")
    await db_instance.db.gift_records.create_index("banquet_id")
    await db_instance.db.gift_records.create_index("created_at")
    await db_instance.db.users.create_index("username", unique=True)
    print("[MongoDB] 索引创建完成")


async def close_mongo_connection():
    """关闭 MongoDB 连接"""
    if db_instance.client:
        db_instance.client.close()


def get_database() -> AsyncIOMotorDatabase:
    """获取数据库实例"""
    if db_instance.db is None:
        raise RuntimeError("Database not initialized")
    return db_instance.db


async def lifespan_manager(app) -> AsyncGenerator[None, None]:
    """应用生命周期管理"""
    await connect_to_mongo()
    yield
    await close_mongo_connection()
