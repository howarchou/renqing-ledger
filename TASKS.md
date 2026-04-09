# 人情簿重构任务列表

## 一、数据层重构

### 1.1 简化 IndexedDB（db.ts）
- [x] 删除 `pendingOps` 表
- [x] 删除 `meta` 表
- [x] 简化 `banquets` 表字段：移除 `serverId`、`_syncStatus`、`_localUpdatedAt`、`_serverUpdatedAt`、`_source`
- [x] 简化 `records` 表字段：移除 `serverBanquetId`、`_syncStatus`、`_localUpdatedAt`、`_serverUpdatedAt`、`_source`
- [x] 保留核心字段：`id`、`name`、`date`、`location`、`type`、`frozen`、`createdAt`、`deletedAt`

### 1.2 重写 local-data.ts
- [x] `getBanquets()` - 获取所有 local 宴会（未删除）
- [x] `getBanquet(id)` - 获取单个 local 宴会
- [x] `createBanquet(data)` - 创建 local 宴会（生成 `temp_*` ID）
- [x] `updateBanquet(id, data)` - 更新 local 宴会
- [x] `deleteBanquet(id)` - 软删除 local 宴会
- [x] `getRecordsByBanquet(banquetId)` - 获取宴会下的 local 记录
- [x] `createRecord(banquetId, data)` - 创建 local 记录
- [x] `updateRecord(id, data)` - 更新 local 记录
- [x] `deleteRecord(id)` - 软删除 local 记录

### 1.3 新建 remote-data.ts（API 封装）
- [x] `getBanquets()` - 调用 `/api/banquets` 获取所有 remote 宴会
- [x] `getBanquet(id)` - 调用 `/api/banquets/{id}` 获取单个宴会
- [x] `createBanquet(data)` - 调用 `POST /api/banquets`
- [x] `updateBanquet(id, data)` - 调用 `PUT /api/banquets/{id}`
- [x] `deleteBanquet(id)` - 调用 `DELETE /api/banquets/{id}`
- [x] `freezeBanquet(id)` - 调用 `POST /api/banquets/{id}/freeze`
- [x] `getRecordsByBanquet(banquetId)` - 调用 `/api/banquets/{id}/records`
- [x] `createRecord(banquetId, data)` - 调用 `POST /api/banquets/{id}/records`
- [x] `updateRecord(id, data)` - 调用 `PUT /api/records/{id}`
- [x] `deleteRecord(id)` - 调用 `DELETE /api/records/{id}`
- [x] `getStatistics(banquetId)` - 调用 `/api/banquets/{id}/statistics`

---

## 二、状态管理层

### 2.1 简化/修改 useBanquetStore（local 数据）
- [x] 仅管理 local 数据（IndexedDB）
- [x] `banquets` - local 宴会列表
- [x] `records` - local 记录列表
- [x] `load()` - 从 IndexedDB 加载本地数据
- [x] `add(data)` - 创建 local 宴会
- [x] `update(id, data)` - 更新 local 宴会
- [x] `remove(id)` - 删除 local 宴会
- [x] `addRecord(banquetId, data)` - 创建 local 记录
- [x] `updateRecord(id, data)` - 更新 local 记录
- [x] `removeRecord(id)` - 删除 local 记录

### 2.2 新建 useRemoteStore（remote 数据）
- [x] 管理 remote 数据（内存 + API）
- [x] `banquets` - remote 宴会列表
- [x] `records` - remote 记录列表
- [x] `isLoading` - 加载状态
- [x] `load()` - 登录后从 API 加载所有数据
- [x] `add(data)` - 创建 remote 宴会（API）
- [x] `update(id, data)` - 更新 remote 宴会（API）
- [x] `remove(id)` - 删除 remote 宴会（API）
- [x] `freeze(id)` - 归档 remote 宴会（API）
- [x] `addRecord(banquetId, data)` - 创建 remote 记录（API）
- [x] `updateRecord(id, data)` - 更新 remote 记录（API）
- [x] `removeRecord(id)` - 删除 remote 记录（API）

### 2.3 修改 useAuthStore
- [x] `login()` - 登录成功后调用 `useRemoteStore.load()` 加载远程数据
- [x] `logout()` - 登出时清空 `useRemoteStore` 数据

### 2.4 修改 useBanquets（合并 hook）
- [x] `banquets` - 合并 local + remote 数据
- [x] `getBanquetSource()` - 获取宴会来源
- [x] `getRecords()` - 获取宴会记录（区分来源）
- [x] `pushBanquet(id)` - 推送 local 宴会到云端

---

## 三、API 层

### 3.1 简化 api.ts
- [x] 移除与同步相关的 Token 存储逻辑（改用 auth-store）
- [x] 保留标准 API 调用封装
- [x] 确保各端点与后端匹配

---

## 四、UI 层

### 4.1 修改 Index 页面（首页）
- [x] 合并展示 local（`useBanquetStore`）和 remote（`useRemoteStore`）数据
- [x] local 数据和 remote 数据分开展示或用标记区分
- [x] local 宴会创建走本地
- [x] remote 宴会操作走 API
- [x] 未登录状态仅显示 local 数据

### 4.2 修改 BanquetCard 组件
- [x] 显示数据来源标记（local/remote）
- [x] local 操作：直接本地处理
- [x] remote 操作：通过 API 处理
- [x] 删除按钮：local 软删除 / remote API 删除
- [x] 添加推送按钮：local 宴会可推送到云端

### 4.3 修改 BanquetDetail 页面
- [x] 根据 banquet 类型（local/remote）调用对应的 Store
- [x] 礼金记录的增删改查分流

### 4.4 修改 CreateBanquetDialog
- [x] 创建的宴会默认写入 IndexedDB（local）

### 4.5 修改 GiftRecordForm / GiftRecordList
- [x] 根据 banquet 类型走不同的数据层

### 4.6 清理 Auth 页面
- [x] 确保登录成功后会加载 remote 数据

---

## 五、清理工作

### 5.1 删除废弃文件
- [x] 删除 `sync.ts`
- [x] 删除 `offline-store.ts`

### 5.2 删除废弃组件
- [x] 删除 `sync-indicator.tsx`

---

## 六、测试验证

### 6.1 游客模式
- [ ] 可正常创建/查看/编辑/删除本地宴会
- [ ] 可正常创建/查看/编辑/删除本地礼金记录
- [ ] 刷新页面数据保持

### 6.2 登录模式
- [ ] 登录后正确加载云端数据
- [ ] local 数据和 remote 数据正确合并展示
- [ ] remote 数据操作（增删改查）正常工作
- [ ] local 数据操作正常工作
- [ ] 登出后 remote 数据清空，恢复本地模式

### 6.3 离线模式
- [ ] 未登录状态下网络断开，local 数据正常访问
- [ ] 登录状态下网络断开，remote 数据操作禁用，本地操作正常
