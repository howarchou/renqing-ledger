/**
 * 宴会数据 Hook - 合并 local 和 remote 数据
 */
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useBanquetStore } from '@/lib/data-store';
import { useRemoteStore } from '@/lib/remote-store';
import { useAuthStore } from '@/lib/auth-store';
import type { LocalBanquet, LocalGiftRecord } from '@/lib/db';
import type { Banquet, GiftRecord } from './api';

// 类型标记
export type DataSource = 'local' | 'remote';

interface BanquetWithSource {
  banquet: Banquet;
  source: DataSource;
}

// 类型转换：LocalBanquet -> Banquet
function toBanquet(local: LocalBanquet): Banquet {
  return {
    id: local.id,
    name: local.name,
    date: local.date,
    location: local.location,
    type: local.type,
    frozen: local.frozen,
    created_at: local.createdAt,
  };
}

// 类型转换：LocalGiftRecord -> GiftRecord
function toRecord(local: LocalGiftRecord): GiftRecord {
  return {
    id: local.id,
    banquet_id: local.banquetId,
    guest_name: local.guestName,
    amount: local.amount,
    gifts: local.gifts,
    note: local.note,
    created_at: local.createdAt,
  };
}

export function useBanquets() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // local store
  const localBanquets = useBanquetStore((state) => state.banquets);
  const localRecords = useBanquetStore((state) => state.records);
  const loadLocal = useBanquetStore((state) => state.load);
  const addLocal = useBanquetStore((state) => state.add);
  const removeLocal = useBanquetStore((state) => state.remove);
  const updateLocal = useBanquetStore((state) => state.update);
  const freezeLocal = useBanquetStore((state) => state.freeze);
  const addRecordLocal = useBanquetStore((state) => state.addRecord);
  const updateRecordLocal = useBanquetStore((state) => state.updateRecord);
  const removeRecordLocal = useBanquetStore((state) => state.removeRecord);

  // remote store
  const remoteBanquets = useRemoteStore((state) => state.banquets);
  const remoteRecords = useRemoteStore((state) => state.records);
  const loadRemote = useRemoteStore((state) => state.load);
  const addRemote = useRemoteStore((state) => state.add);
  const removeRemote = useRemoteStore((state) => state.remove);
  const updateRemote = useRemoteStore((state) => state.update);
  const freezeRemote = useRemoteStore((state) => state.freeze);
  const addRecordRemote = useRemoteStore((state) => state.addRecord);
  const updateRecordRemote = useRemoteStore((state) => state.updateRecord);
  const removeRecordRemote = useRemoteStore((state) => state.removeRecord);

  // 初始加载
  useEffect(() => {
    loadLocal().catch((err) => setError(String(err)));
  }, [loadLocal]);

  // 合并数据
  const banquets = useMemo((): BanquetWithSource[] => {
    const localData: BanquetWithSource[] = localBanquets.map(b => ({
      banquet: toBanquet(b),
      source: 'local' as DataSource,
    }));

    if (isAuthenticated) {
      const remoteData: BanquetWithSource[] = remoteBanquets.map(b => ({
        banquet: b,
        source: 'remote' as DataSource,
      }));
      return [...localData, ...remoteData];
    }

    return localData;
  }, [localBanquets, remoteBanquets, isAuthenticated]);

  // 获取宴会来源
  const getBanquetSource = useCallback((id: string): DataSource | undefined => {
    const found = banquets.find(b => b.banquet.id === id);
    return found?.source;
  }, [banquets]);

  // 获取宴会
  const getBanquet = useCallback((id: string): Banquet | undefined => {
    return banquets.find(b => b.banquet.id === id)?.banquet;
  }, [banquets]);

  // 获取宴会记录
  const getRecords = useCallback((banquetId: string): { record: GiftRecord; source: DataSource }[] => {
    const localRecs = localRecords
      .filter(r => r.banquetId === banquetId)
      .map(r => ({ record: toRecord(r), source: 'local' as DataSource }));

    if (isAuthenticated) {
      const remoteRecs = remoteRecords
        .filter(r => r.banquet_id === banquetId)
        .map(r => ({ record: r, source: 'remote' as DataSource }));
      return [...localRecs, ...remoteRecs];
    }

    return localRecs;
  }, [localRecords, remoteRecords, isAuthenticated]);

  // 创建宴会（始终创建 local）
  const addBanquet = useCallback(
    async (data: Omit<Banquet, 'id' | 'created_at'>) => {
      setIsLoading(true);
      try {
        return await addLocal({
          name: data.name,
          date: data.date,
          location: data.location,
          type: data.type as LocalBanquet['type'],
          frozen: false,
          createdAt: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [addLocal]
  );

  // 删除宴会
  const deleteBanquet = useCallback(
    async (id: string) => {
      const source = getBanquetSource(id);
      if (!source) return;

      setIsLoading(true);
      try {
        if (source === 'local') {
          await removeLocal(id);
        } else {
          await removeRemote(id);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [getBanquetSource, removeLocal, removeRemote]
  );

  // 归档宴会
  const freezeBanquet = useCallback(
    async (id: string) => {
      const source = getBanquetSource(id);
      if (!source) return;

      if (source === 'local') {
        await freezeLocal(id);
      } else {
        await freezeRemote(id);
      }
    },
    [getBanquetSource, freezeLocal, freezeRemote]
  );

  // 创建礼金记录
  const addRecord = useCallback(
    async (banquetId: string, data: { guest_name: string; amount: number; gifts: string[]; note: string }) => {
      const source = getBanquetSource(banquetId);
      if (!source) return;

      setIsLoading(true);
      try {
        if (source === 'local') {
          await addRecordLocal(banquetId, {
            guestName: data.guest_name,
            amount: data.amount,
            gifts: data.gifts,
            note: data.note,
          });
        } else {
          await addRecordRemote(banquetId, data);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [getBanquetSource, addRecordLocal, addRecordRemote]
  );

  // 更新礼金记录
  const updateRecord = useCallback(
    async (id: string, data: { guest_name?: string; amount?: number; gifts?: string[]; note?: string }) => {
      // 查找记录来源
      const localRec = localRecords.find(r => r.id === id);
      if (localRec) {
        await updateRecordLocal(id, {
          guestName: data.guest_name,
          amount: data.amount,
          gifts: data.gifts,
          note: data.note,
        });
        return;
      }

      const remoteRec = remoteRecords.find(r => r.id === id);
      if (remoteRec) {
        await updateRecordRemote(id, data);
        return;
      }
    },
    [localRecords, remoteRecords, updateRecordLocal, updateRecordRemote]
  );

  // 删除礼金记录
  const deleteRecord = useCallback(
    async (id: string) => {
      const localRec = localRecords.find(r => r.id === id);
      if (localRec) {
        await removeRecordLocal(id);
        return;
      }

      const remoteRec = remoteRecords.find(r => r.id === id);
      if (remoteRec) {
        await removeRecordRemote(id);
        return;
      }
    },
    [localRecords, remoteRecords, removeRecordLocal, removeRecordRemote]
  );

  // 推送本地宴会到云端
  const pushBanquet = useCallback(
    async (id: string) => {
      if (!isAuthenticated) return;

      const localBanquet = localBanquets.find(b => b.id === id);
      if (!localBanquet) return;

      const localRecordsForBanquet = localRecords.filter(r => r.banquetId === id);

      setIsLoading(true);
      try {
        // 1. 创建 remote 宴会
        const remoteBanquet = await addRemote({
          name: localBanquet.name,
          date: localBanquet.date,
          location: localBanquet.location,
          type: localBanquet.type,
        });

        // 2. 创建 remote 记录
        for (const rec of localRecordsForBanquet) {
          await addRecordRemote(remoteBanquet.id, {
            guest_name: rec.guestName,
            amount: rec.amount,
            gifts: rec.gifts,
            note: rec.note,
          });
        }

        // 3. 删除本地数据
        await removeLocal(id);

        // 4. 刷新 remote 数据
        await loadRemote();
      } catch (err) {
        setError(String(err));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, localBanquets, localRecords, addRemote, addRecordRemote, removeLocal, loadRemote]
  );

  // 刷新
  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      await loadLocal();
      if (isAuthenticated) {
        await loadRemote();
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, [loadLocal, loadRemote, isAuthenticated]);

  return {
    banquets,
    isLoading,
    error,
    getBanquet,
    getBanquetSource,
    getRecords,
    addBanquet,
    deleteBanquet,
    freezeBanquet,
    pushBanquet,
    addRecord,
    updateRecord,
    deleteRecord,
    reload,
  };
}
