/**
 * 本地数据访问层 - IndexedDB 操作
 * 仅处理 local 数据（本地创建）
 */
import { db, LocalBanquet, LocalGiftRecord, generateTempId } from './db';

// ============== 宴会操作 ==============

/**
 * 获取所有 local 宴会（未删除）
 */
export async function getBanquets(): Promise<LocalBanquet[]> {
  return db.banquets.filter(b => !b.deletedAt).toArray();
}

/**
 * 获取单个 local 宴会
 */
export async function getBanquet(id: string): Promise<LocalBanquet | undefined> {
  return db.banquets.get(id);
}

/**
 * 创建 local 宴会
 */
export async function createBanquet(
  data: Omit<LocalBanquet, 'id'>
): Promise<LocalBanquet> {
  const banquet: LocalBanquet = {
    ...data,
    id: generateTempId(),
  };

  await db.banquets.add(banquet);
  return banquet;
}

/**
 * 更新 local 宴会
 */
export async function updateBanquet(
  id: string,
  data: Partial<Omit<LocalBanquet, 'id'>>
): Promise<void> {
  const existing = await db.banquets.get(id);
  if (!existing) throw new Error('宴会不存在');

  await db.banquets.update(id, data);
}

/**
 * 删除 local 宴会（软删除）
 */
export async function deleteBanquet(id: string): Promise<void> {
  await db.banquets.update(id, { deletedAt: new Date().toISOString() });
}

/**
 * 归档 local 宴会
 */
export async function freezeBanquet(id: string): Promise<void> {
  await db.banquets.update(id, { frozen: true });
}

// ============== 礼金记录操作 ==============

/**
 * 获取宴会下的所有 local 记录（未删除）
 */
export async function getRecordsByBanquet(banquetId: string): Promise<LocalGiftRecord[]> {
  return db.records
    .where('banquetId')
    .equals(banquetId)
    .filter(r => !r.deletedAt)
    .toArray();
}

/**
 * 获取单个 local 记录
 */
export async function getRecord(id: string): Promise<LocalGiftRecord | undefined> {
  return db.records.get(id);
}

/**
 * 创建 local 礼金记录
 */
export async function createRecord(
  banquetId: string,
  data: Omit<LocalGiftRecord, 'id' | 'banquetId'>
): Promise<LocalGiftRecord> {
  const record: LocalGiftRecord = {
    ...data,
    id: generateTempId(),
    banquetId,
  };

  await db.records.add(record);
  return record;
}

/**
 * 更新 local 礼金记录
 */
export async function updateRecord(
  id: string,
  data: Partial<Omit<LocalGiftRecord, 'id' | 'banquetId'>>
): Promise<void> {
  const existing = await db.records.get(id);
  if (!existing) throw new Error('记录不存在');

  await db.records.update(id, data);
}

/**
 * 删除 local 礼金记录（软删除）
 */
export async function deleteRecord(id: string): Promise<void> {
  await db.records.update(id, { deletedAt: new Date().toISOString() });
}
