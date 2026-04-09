/**
 * 远程数据访问层 - API 操作
 * 所有操作通过 API 完成，数据存储在内存中
 */
import { banquetApi, recordApi, Banquet, GiftRecord } from './api';

// ============== 宴会操作 ==============

/**
 * 获取所有 remote 宴会
 */
export async function getBanquets(): Promise<Banquet[]> {
  return banquetApi.list();
}

/**
 * 获取单个 remote 宴会
 */
export async function getBanquet(id: string): Promise<Banquet> {
  return banquetApi.get(id);
}

/**
 * 创建 remote 宴会
 */
export async function createBanquet(data: {
  name: string;
  date: string;
  location: string;
  type: string;
}): Promise<Banquet> {
  return banquetApi.create(data);
}

/**
 * 更新 remote 宴会
 */
export async function updateBanquet(
  id: string,
  data: { name?: string; date?: string; location?: string; type?: string }
): Promise<Banquet> {
  return banquetApi.update(id, data);
}

/**
 * 删除 remote 宴会
 */
export async function deleteBanquet(id: string): Promise<void> {
  return banquetApi.delete(id);
}

/**
 * 归档 remote 宴会
 */
export async function freezeBanquet(id: string): Promise<Banquet> {
  return banquetApi.freeze(id);
}

// ============== 礼金记录操作 ==============

/**
 * 获取宴会下的所有 remote 记录
 */
export async function getRecordsByBanquet(banquetId: string): Promise<GiftRecord[]> {
  return recordApi.list(banquetId);
}

/**
 * 创建 remote 礼金记录
 */
export async function createRecord(
  banquetId: string,
  data: { guest_name: string; amount: number; gifts: string[]; note: string }
): Promise<GiftRecord> {
  return recordApi.create(banquetId, data);
}

/**
 * 更新 remote 礼金记录
 */
export async function updateRecord(
  id: string,
  data: { guest_name?: string; amount?: number; gifts?: string[]; note?: string }
): Promise<GiftRecord> {
  return recordApi.update(id, data);
}

/**
 * 删除 remote 礼金记录
 */
export async function deleteRecord(id: string): Promise<void> {
  return recordApi.delete(id);
}
