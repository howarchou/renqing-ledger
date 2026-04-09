/**
 * local 宴会数据管理 - IndexedDB
 */
import { create } from 'zustand';
import * as localData from './local-data';
import type { LocalBanquet, LocalGiftRecord } from './db';

interface BanquetState {
  // 数据
  banquets: LocalBanquet[];
  records: LocalGiftRecord[];
  isLoading: boolean;
  error?: string;

  // 操作
  load: () => Promise<void>;
  add: (data: Omit<LocalBanquet, 'id'>) => Promise<LocalBanquet>;
  update: (id: string, data: Partial<Omit<LocalBanquet, 'id'>>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  freeze: (id: string) => Promise<void>;
  addRecord: (banquetId: string, data: Omit<LocalGiftRecord, 'id' | 'banquetId'>) => Promise<LocalGiftRecord>;
  updateRecord: (id: string, data: Partial<Omit<LocalGiftRecord, 'id' | 'banquetId'>>) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  getRecordsByBanquet: (banquetId: string) => LocalGiftRecord[];
}

export const useBanquetStore = create<BanquetState>((set, get) => ({
  banquets: [],
  records: [],
  isLoading: false,

  // 加载本地数据
  load: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const banquets = await localData.getBanquets();
      const records: LocalGiftRecord[] = [];

      for (const b of banquets) {
        const recs = await localData.getRecordsByBanquet(b.id);
        records.push(...recs);
      }

      banquets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      set({ banquets, records, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  // 创建宴会
  add: async (data) => {
    const created = await localData.createBanquet(data);

    set((state) => ({
      banquets: [created, ...state.banquets],
    }));

    return created;
  },

  // 更新宴会
  update: async (id, data) => {
    await localData.updateBanquet(id, data);

    set((state) => ({
      banquets: state.banquets.map(b =>
        b.id === id ? { ...b, ...data } : b
      ),
    }));
  },

  // 删除宴会（软删除）
  remove: async (id) => {
    await localData.deleteBanquet(id);

    set((state) => ({
      banquets: state.banquets.filter(b => b.id !== id),
      records: state.records.filter(r => r.banquetId !== id),
    }));
  },

  // 归档宴会
  freeze: async (id) => {
    await localData.freezeBanquet(id);

    set((state) => ({
      banquets: state.banquets.map(b =>
        b.id === id ? { ...b, frozen: true } : b
      ),
    }));
  },

  // 创建礼金记录
  addRecord: async (banquetId, data) => {
    const created = await localData.createRecord(banquetId, data);

    set((state) => ({
      records: [...state.records, created],
    }));

    return created;
  },

  // 更新礼金记录
  updateRecord: async (id, data) => {
    await localData.updateRecord(id, data);

    set((state) => ({
      records: state.records.map(r =>
        r.id === id ? { ...r, ...data } : r
      ),
    }));
  },

  // 删除礼金记录（软删除）
  removeRecord: async (id) => {
    await localData.deleteRecord(id);

    set((state) => ({
      records: state.records.filter(r => r.id !== id),
    }));
  },

  // 获取宴会下的记录
  getRecordsByBanquet: (banquetId) => {
    return get().records.filter(r => r.banquetId === banquetId);
  },
}));
