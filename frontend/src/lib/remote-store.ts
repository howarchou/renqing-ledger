/**
 * remote 宴会数据管理 - API + 内存
 * 登录后加载，所有操作走 API
 */
import { create } from 'zustand';
import * as remoteData from './remote-data';
import type { Banquet, GiftRecord } from './api';

interface RemoteState {
  // 数据
  banquets: Banquet[];
  records: GiftRecord[];
  isLoading: boolean;
  error?: string;

  // 操作
  load: () => Promise<void>;
  clear: () => void;
  add: (data: { name: string; date: string; location: string; type: string }) => Promise<Banquet>;
  update: (id: string, data: { name?: string; date?: string; location?: string; type?: string }) => Promise<void>;
  remove: (id: string) => Promise<void>;
  freeze: (id: string) => Promise<void>;
  addRecord: (banquetId: string, data: { guest_name: string; amount: number; gifts: string[]; note: string }) => Promise<GiftRecord>;
  updateRecord: (id: string, data: { guest_name?: string; amount?: number; gifts?: string[]; note?: string }) => Promise<void>;
  removeRecord: (id: string) => Promise<void>;
  getRecordsByBanquet: (banquetId: string) => GiftRecord[];
}

export const useRemoteStore = create<RemoteState>((set, get) => ({
  banquets: [],
  records: [],
  isLoading: false,

  // 加载远程数据
  load: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const banquets = await remoteData.getBanquets();
      const records: GiftRecord[] = [];

      for (const b of banquets) {
        if (!b.deleted_at) {
          const recs = await remoteData.getRecordsByBanquet(b.id);
          records.push(...recs.filter(r => !r.deleted_at));
        }
      }

      banquets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      set({ banquets: banquets.filter(b => !b.deleted_at), records, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  // 清空数据（登出时）
  clear: () => {
    set({ banquets: [], records: [], isLoading: false, error: undefined });
  },

  // 创建宴会
  add: async (data) => {
    const created = await remoteData.createBanquet(data);

    set((state) => ({
      banquets: [created, ...state.banquets],
    }));

    return created;
  },

  // 更新宴会
  update: async (id, data) => {
    await remoteData.updateBanquet(id, data);

    set((state) => ({
      banquets: state.banquets.map(b =>
        b.id === id ? { ...b, ...data } : b
      ),
    }));
  },

  // 删除宴会
  remove: async (id) => {
    await remoteData.deleteBanquet(id);

    set((state) => ({
      banquets: state.banquets.filter(b => b.id !== id),
      records: state.records.filter(r => r.banquet_id !== id),
    }));
  },

  // 归档宴会
  freeze: async (id) => {
    const updated = await remoteData.freezeBanquet(id);

    set((state) => ({
      banquets: state.banquets.map(b =>
        b.id === id ? updated : b
      ),
    }));
  },

  // 创建礼金记录
  addRecord: async (banquetId, data) => {
    const created = await remoteData.createRecord(banquetId, data);

    set((state) => ({
      records: [...state.records, created],
    }));

    return created;
  },

  // 更新礼金记录
  updateRecord: async (id, data) => {
    await remoteData.updateRecord(id, data);

    set((state) => ({
      records: state.records.map(r =>
        r.id === id ? { ...r, ...data } : r
      ),
    }));
  },

  // 删除礼金记录
  removeRecord: async (id) => {
    await remoteData.deleteRecord(id);

    set((state) => ({
      records: state.records.filter(r => r.id !== id),
    }));
  },

  // 获取宴会下的记录
  getRecordsByBanquet: (banquetId) => {
    return get().records.filter(r => r.banquet_id === banquetId);
  },
}));
