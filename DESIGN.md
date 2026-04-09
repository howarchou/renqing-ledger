# 人情簿系统设计文档

## 一、系统概述

人情簿是一个支持离线优先的礼金记录管理系统，采用前后端分离架构。

### 核心特性

- **离线优先**：断网环境下可正常创建、查看、修改本地数据
- **本地存储**：本地数据（local）存储在 IndexedDB
- **云端同步**：云端数据（remote）直接读写云端 API
- **数据分离**：local 和 remote 数据独立存储，互不影响
- **数据推送**：local 数据可上传到云端（推送后本地删除）

---

## 二、用户模式

| 模式 | local 数据 | remote 数据 |
|------|------------|-------------|
| **游客模式** | 读写删除（IndexedDB） | 无 |
| **离线模式** | 读写删除（IndexedDB） | 无 |
| **登录模式** | 读写删除（IndexedDB） + 可推送 | 读写删除（API） |

### 2.1 数据类型定义

| 类型 | 存储位置 | 操作 |
|------|----------|------|
| `local` | IndexedDB | 所有操作在本地完成，可推送至云端 |
| `remote` | 云端 | 所有操作通过 API |

### 2.2 登录流程

1. 用户登录
2. 从云端拉取所有数据（内存缓存）
3. 后续 remote 数据操作直接走 API
4. local 数据保持不变，继续在 IndexedDB 中

### 2.3 推送流程（local → remote）

1. 用户点击 local 宴会卡片上的"上传"按钮
2. 调用 API 创建 remote 宴会
3. 调用 API 创建所有关联的礼金记录
4. 删除 IndexedDB 中的 local 数据
5. 刷新页面，宴会自动出现在 remote 区域

---

## 三、数据架构

### 3.1 本地存储（IndexedDB）

使用 **Dexie.js** ORM，数据库名：`renqing-ledger`

#### 表结构

**banquets 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 主键（本地临时 ID：`temp_*`） |
| name | string | 宴会名称 |
| date | string | 宴会日期 |
| location | string | 宴会地点 |
| type | string | 宴会类型 |
| frozen | boolean | 是否归档 |
| createdAt | string | 创建时间 |
| deletedAt | string? | 软删除时间 |

**records 表**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 主键 |
| banquetId | string | 所属宴会 ID |
| guestName | string | 宾客姓名 |
| amount | number | 礼金金额 |
| gifts | string[] | 礼品列表 |
| note | string | 备注 |
| createdAt | string | 创建时间 |
| deletedAt | string? | 软删除时间 |

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

## 四、数据流

### 4.1 local 数据操作

```
用户操作（local） → IndexedDB
                        ↓
                   乐观更新 UI
```

### 4.2 remote 数据操作

```
用户操作（remote） → API 调用 → 云端
                        ↓
                   乐观更新 UI（内存缓存）
```

### 4.3 推送操作（local → remote）

```
用户点击"上传" → 创建 remote 宴会 → 创建 remote 记录 → 删除 local 数据
```

### 4.4 登录时数据加载

```
登录 → 拉取远程数据 → 存入内存
```

---

## 五、前端架构

### 5.1 状态管理

| Store | 职责 |
|-------|------|
| `useAuthStore` | 用户认证状态 |
| `useBanquetStore` | local 宴会数据管理（IndexedDB） |
| `useRemoteStore` | remote 宴会数据管理（内存 + API） |

### 5.2 核心模块

```
src/lib/
├── db.ts           # IndexedDB 数据库定义（Dexie）
├── local-data.ts   # local 数据访问层
├── remote-data.ts  # remote 数据访问层（API 封装）
├── auth-store.ts   # 认证状态管理
├── api.ts          # 后端 API 封装
├── data-store.ts   # useBanquetStore（local 数据）
└── remote-store.ts # useRemoteStore（remote 数据）

src/hooks/
└── useBanquets.ts  # 合并 local + remote，封装业务逻辑
```

### 5.3 关键流程

**新建 local 宴会**
1. 生成临时 ID：`temp_${Date.now()}`
2. 写入 IndexedDB
3. 乐观更新 UI

**登录后加载 remote 数据**
1. 调用 `/api/banquets` 获取所有宴会
2. 调用 `/api/banquets/{id}/records` 获取各宴会礼金记录
3. 数据存入 `useRemoteStore`（内存）
4. 首页合并展示：local（IndexedDB）+ remote（内存）

**操作 remote 宴会**
1. 调用对应 API
2. 成功后更新内存状态
3. 失败则回滚 UI

**推送 local 宴会**
1. 调用 `POST /api/banquets` 创建 remote 宴会
2. 调用 `POST /api/banquets/{id}/records` 创建各记录
3. 从 IndexedDB 删除 local 宴会和关联记录
4. 刷新 `useRemoteStore`

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

### 7.1 联网检测

使用浏览器原生 `navigator.onLine` 和 `online/offline` 事件检测网络。

### 7.2 离线行为

| 数据类型 | 读 | 写 | 删 | 推送 |
|----------|-----|-----|-----|------|
| local | 正常 | 正常 | 正常 | **需联网** |
| remote | 正常（内存缓存） | **需联网** | **需联网** | 不适用 |

---

## 八、数据流向图

### 游客/离线模式
```
用户操作 → local-data.ts → IndexedDB
                ↓
           useBanquetStore
                ↓
            UI 渲染
```

### 登录模式
```
登录 → 拉取远程数据 → useRemoteStore（内存）
                ↓
用户操作 local → local-data.ts → IndexedDB
用户操作 remote → remote-data.ts → API
用户推送 local → remote-data.ts → API → 删除 local
                ↓
           合并 UI 渲染
```

---

## 九、关键设计决策

1. **local 数据全本地**：所有操作走 IndexedDB，完全离线可用
2. **remote 数据全线上**：所有操作走 API，本地无缓存
3. **无待同步机制**：取消 pendingOps 和同步状态字段
4. **手动推送**：local 数据由用户主动触发推送到云端（推送后本地删除）
5. **数据独立**：local 和 remote 数据源完全分离，合并展示但不混同
