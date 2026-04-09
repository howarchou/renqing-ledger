/**
 * IndexedDB 数据库层 - 基于 Dexie
 * 仅存储 local 数据（本地创建）
 */
import Dexie, { Table } from 'dexie';

// 宴会类型
export type BanquetType = '婚礼' | '满月宴' | '乔迁宴' | '寿宴' | '升学宴' | '其他';

// 本地宴会数据
export interface LocalBanquet {
  id: string;                    // 主键（临时 ID：temp_*）
  name: string;
  date: string;
  location: string;
  type: BanquetType;
  frozen: boolean;
  createdAt: string;
  deletedAt?: string;            // 软删除标记
}

// 本地礼金记录
export interface LocalGiftRecord {
  id: string;
  banquetId: string;
  guestName: string;
  amount: number;
  gifts: string[];
  note: string;
  createdAt: string;
  deletedAt?: string;
}

class RenqingDB extends Dexie {
  banquets!: Table<LocalBanquet, string>;
  records!: Table<LocalGiftRecord, string>;

  constructor() {
    super('renqing-ledger');

    this.version(1).stores({
      banquets: 'id, type, date, createdAt, deletedAt',
      records: 'id, banquetId, guestName, createdAt, deletedAt',
    });
  }
}

// 单例
export const db = new RenqingDB();

// 生成临时 ID
export function generateTempId(): string {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
