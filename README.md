# 人情簿 - 礼金记录管理系统

支持离线优先的礼金记录管理应用，采用前后端分离架构。

## 核心特性

- **离线优先** - 断网环境下可正常创建、查看、修改数据
- **本地存储** - 所有数据优先存储在 IndexedDB
- **云端同步** - 登录后可将本地数据同步至服务器
- **数据独立** - 本地数据与云端数据互不影响

## 技术栈

**前端**
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Zustand（状态管理）
- Dexie.js（IndexedDB ORM）
- React Router

**后端**
- FastAPI
- MongoDB + Motor（异步驱动）
- JWT 认证

## 项目结构

```
renqing-ledger/
├── frontend/          # 前端应用
│   ├── src/
│   │   ├── components/  # UI 组件
│   │   ├── pages/       # 页面
│   │   ├── hooks/       # 自定义 Hooks
│   │   ├── lib/         # 核心模块（API、状态管理、同步）
│   │   └── types/       # TypeScript 类型
│   └── package.json
│
├── backend/           # 后端应用
│   ├── app/
│   │   ├── routers/     # API 路由
│   │   ├── services/    # 业务逻辑
│   │   ├── models/      # 数据模型
│   │   └── config.py    # 配置
│   └── pyproject.toml
│
├── CLAUDE.md          # 系统设计文档
└── docker-compose.yml # Docker 部署配置
```

## 快速开始

### 前置要求

- Node.js 18+
- Python 3.13+
- MongoDB（本地或 Docker）

### 安装运行

**前端**

```bash
cd frontend
npm install
npm run dev
```

**后端**

```bash
cd backend
pip install
uvicorn app.main:app --reload
```

### Docker 部署

```bash
docker-compose up -d
```

- 前端：http://localhost:8080
- 后端：http://localhost:8000
- API 文档：http://localhost:8000/docs

## 用户模式

| 模式 | 数据来源 | 操作 |
|------|----------|------|
| 游客模式 | 仅 IndexedDB | 可创建/查看/编辑本地宴会和礼金记录 |
| 离线模式 | 仅 IndexedDB | 与游客模式相同，网络恢复后可同步 |
| 登录模式 | IndexedDB + 云端 | 首页合并展示两地数据，同步后删除本地已上传内容 |

## 同步机制

1. 所有写操作优先写入 IndexedDB
2. 离线操作记录到 `pendingOps` 队列
3. 登录用户触发同步时，将待同步操作推送至服务器
4. 推送成功后删除本地已同步数据

## 数据存储

**本地（IndexedDB）**
- `banquets` - 宴会表
- `records` - 礼金记录表
- `pendingOps` - 待同步操作队列

**云端（MongoDB）**
- `users` - 用户表
- `banquets` - 宴会表
- `gift_records` - 礼金记录表

## API 端点

**认证**
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户

**宴会**
- `GET /api/banquets` - 获取所有宴会
- `POST /api/banquets` - 创建宴会
- `GET /api/banquets/{id}` - 获取宴会详情
- `PUT /api/banquets/{id}` - 更新宴会
- `DELETE /api/banquets/{id}` - 删除宴会
- `POST /api/banquets/{id}/freeze` - 归档宴会

**礼金记录**
- `GET /api/banquets/{id}/records` - 获取礼金记录
- `POST /api/banquets/{id}/records` - 创建礼金记录
- `PUT /api/records/{id}` - 更新礼金记录
- `DELETE /api/records/{id}` - 删除礼金记录

**统计**
- `GET /api/banquets/{id}/statistics` - 获取统计数据

详细 API 文档请访问 `/docs`。

## 许可证

MIT