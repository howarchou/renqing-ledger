# 人情簿系统设计文档

## 一、系统概述

人情簿是一个支持离线优先的礼金记录管理系统，采用前后端分离架构。

### 核心特性

- **离线优先**：断网环境下可正常创建、查看、修改数据
- **本地存储**：所有数据优先存储在 IndexedDB
- **云端同步**：登录后可将本地数据同步至服务器
- **数据独立**：本地数据与云端数据互不影响

---

## 二、用户模式

| 模式 | 数据来源 | 操作 |
|------|----------|------|
| **游客模式** | 仅 IndexedDB | 可创建/查看/编辑本地宴会和礼金记录 |
| **离线模式** | 仅 IndexedDB | 与游客模式相同，网络恢复后可同步 |
| **登录模式** | IndexedDB + 云端 | 首页合并展示两地数据，同步后删除本地已上传内容 |

### 登录后同步逻辑

1. 用户触发同步（手动）
2. 本地待同步数据（pendingOps）推送至服务器
3. 推送成功后，**删除本地已同步的数据和记录**
4. 后续操作直接读写云端 API，本地仅保留未同步的增量

---

## 三、数据架构

### 3.1 本地存储（IndexedDB）

使用 **Dexie.js** ORM，数据库名：`renqing-ledger`

#### 表结构

**banquets 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 主键（本地临时 ID：`temp_*` 或服务端 ID） |
| serverId | string? | 已同步的服务端 ID（离线创建时） |
| name | string | 宴会名称 |
| date | string | 宴会日期 |
| location | string | 宴会地点 |
| type | string | 宴会类型 |
| frozen | boolean | 是否归档 |
| createdAt | string | 创建时间 |
| deletedAt | string? | 软删除时间 |
| _syncStatus | string | 同步状态：`synced` / `pending` / `conflict` |
| _localUpdatedAt | string | 本地更新时间 |
| _serverUpdatedAt | string? | 服务端更新时间 |
| _source | string | 数据来源：`local` / `remote` |

**records 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 主键 |
| banquetId | string | 所属宴会 ID |
| serverBanquetId | string? | 对应的服务端宴会 ID |
| guestName | string | 宾客姓名 |
| amount | number | 礼金金额 |
| gifts | string[] | 礼品列表 |
| note | string | 备注 |
| createdAt | string | 创建时间 |
| deletedAt | string? | 软删除时间 |
| _syncStatus | string | 同步状态 |
| _localUpdatedAt | string | 本地更新时间 |
| _serverUpdatedAt | string? | 服务端更新时间 |
| _source | string | 数据来源 |

**pendingOps 表**（待同步操作队列）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 自增主键 |
| type | string | 操作类型：`create` / `update` / `delete` |
| entity | string | 实体类型：`banquet` / `record` |
| entityId | string | 实体 ID |
| data | any | 操作数据（create/update 时） |
| timestamp | string | 操作时间 |
| retryCount | number | 重试次数 |

**meta 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| key | string | 键名 |
| value | string | 键值 |

### 3.2 云端存储（MongoDB）

数据库名：`renqing`

#### Collections

**users**
```json
{
  "_id": "ObjectId",
  "username": "string",
  "password_hash": "string",
  "created_at": "datetime"
}
```

**banquets**
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "name": "string",
  "date": "string",
  "location": "string",
  "type": "string",
  "frozen": "boolean",
  "created_at": "datetime",
  "deleted_at": "datetime?"
}
```

**gift_records**
```json
{
  "_id": "ObjectId",
  "banquet_id": "ObjectId",
  "user_id": "ObjectId",
  "guest_name": "string",
  "amount": "integer",
  "gifts": ["string"],
  "note": "string",
  "created_at": "datetime",
  "deleted_at": "datetime?"
}
```

---

## 四、同步机制

### 4.1 同步流程

```
用户触发同步
    │
    ▼
检测网络状态 ──离线──▶ 结束（返回错误）
    │
   在线
    │
    ▼
验证 Token ──无效──▶ 结束（返回错误，需重新登录）
    │
   有效
    │
    ▼
从 pendingOps 按 timestamp 顺序取出操作
    │
    ▼
执行操作（create/update/delete）
    │
    ├── 成功 ──▶ 删除 pendingOps 中对应记录
    │
    └── 失败 ──▶ retryCount + 1，记录保留
    │
    ▼
所有操作处理完毕
    │
    ▼
同步完成
```

### 4.2 同步冲突处理

- 本地优先：所有写操作先写入 IndexedDB
- 冲突标记：`_syncStatus: 'conflict'` 需人工介入
- 自动重试：失败操作最多重试 5 次

### 4.3 同步成功后的数据清理

当 `pendingOps` 中的操作成功推送到服务器后：
1. 删除本地对应的 banquet/record 记录
2. 关联记录更新 banquetId 为 serverBanquetId

---

## 五、前端架构

### 5.1 状态管理

| Store | 职责 |
|-------|------|
| `useAuthStore` | 用户认证状态（Zustand） |
| `useBanquetStore` | 宴会数据管理（Zustand） |
| `useOfflineStore` | 离线/同步状态管理（Zustand） |

### 5.2 核心模块

```
src/lib/
├── db.ts           # IndexedDB 数据库定义（Dexie）
├── local-data.ts   # 本地数据访问层
├── sync.ts         # 同步引擎（SyncManager）
├── offline-store.ts # 离线状态管理
├── auth-store.ts   # 认证状态管理
├── api.ts          # 后端 API 封装
└── data-store.ts   # 宴会数据 Store
```

### 5.3 关键流程

**新建宴会（离线）**
1. 生成临时 ID：`temp_${Date.now()}`
2. 写入 IndexedDB，`_syncStatus: 'pending'`
3. 添加到 `pendingOps` 队列
4. 乐观更新 UI

**触发同步（登录状态）**
1. 遍历 `pendingOps`
2. 调用对应 API
3. 成功后删除本地记录
4. 刷新首页数据（从 IndexedDB 重新拉取）

**首页数据加载**
- 始终从 IndexedDB 读取（`getBanquets()`）
- 已登录用户同步成功后，本地数据已清空，只剩新产生的未同步数据

---

## 六、后端架构

### 6.1 技术栈

- **框架**：FastAPI
- **数据库**：MongoDB + Motor（异步驱动）
- **认证**：JWT（Bearer Token）

### 6.2 API 端点

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 注册 | 否 |
| POST | /api/auth/login | 登录 | 否 |
| GET | /api/auth/me | 获取当前用户 | 是 |
| GET | /api/banquets | 获取所有宴会 | 是 |
| POST | /api/banquets | 创建宴会 | 是 |
| GET | /api/banquets/{id} | 获取宴会详情 | 是 |
| PUT | /api/banquets/{id} | 更新宴会 | 是 |
| DELETE | /api/banquets/{id} | 删除宴会 | 是 |
| POST | /api/banquets/{id}/freeze | 归档宴会 | 是 |
| GET | /api/banquets/{id}/records | 获取礼金记录 | 是 |
| POST | /api/banquets/{id}/records | 创建礼金记录 | 是 |
| PUT | /api/records/{id} | 更新礼金记录 | 是 |
| DELETE | /api/records/{id} | 删除礼金记录 | 是 |
| GET | /api/banquets/{id}/statistics | 获取统计数据 | 是 |

### 6.3 公开路由

以下路径无需认证：
- `/api/auth/register`
- `/api/auth/login`
- `/health`
- `/docs`
- `/openapi.json`

---

## 七、网络策略

### 7.1 前端网络检测

```typescript
window.addEventListener('online', () => setOnline(true));
window.addEventListener('offline', () => setOnline(false));
navigator.onLine; // 初始检测
```

### 7.2 离线行为

| 操作 | 离线状态 |
|------|----------|
| 查看宴会列表 | 正常（从 IndexedDB） |
| 创建宴会 | 正常（写入 IndexedDB） |
| 编辑宴会 | 正常（写入 IndexedDB） |
| 删除宴会 | 正常（软删除，写入 IndexedDB） |
| 同步 | 禁用（需网络） |

---

## 八、数据流向图

### 游客/离线模式
```
用户操作 → local-data.ts → IndexedDB (banquets/records/pendingOps)
                ↓
           data-store.ts
                ↓
            UI 渲染
```

### 登录同步模式
```
用户操作 → local-data.ts → IndexedDB
                ↓
           pendingOps
                ↓
        triggerSync() → sync.ts
                ↓
           推送服务器
                ↓
         成功 → 删除本地数据
                ↓
           API 读取 → 合并展示
```

---

## 九、关键设计决策

1. **本地优先写入**：所有写操作优先写入 IndexedDB，保证离线可用
2. **乐观更新**：先更新 UI，后台异步同步
3. **同步后清理**：同步成功即删除本地数据，避免重复
4. **临时 ID 机制**：离线创建使用 `temp_*` 前缀，关联关系通过 `serverBanquetId` 维护
5. **独立数据域**：本地和云端数据各自独立，合并展示但不混同
