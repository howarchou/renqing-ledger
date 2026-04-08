import { useState, useEffect, useCallback } from 'react';
import { Banquet, GiftRecord } from '@/types';

const BANQUETS_KEY = 'renqing_banquets';
const RECORDS_KEY = 'renqing_records';

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch { return []; }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useBanquets() {
  const [banquets, setBanquets] = useState<Banquet[]>(() => load(BANQUETS_KEY));
  const [records, setRecords] = useState<GiftRecord[]>(() => load(RECORDS_KEY));

  useEffect(() => save(BANQUETS_KEY, banquets), [banquets]);
  useEffect(() => save(RECORDS_KEY, records), [records]);

  const addBanquet = useCallback((b: Omit<Banquet, 'id' | 'createdAt'>) => {
    const newB: Banquet = { ...b, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setBanquets(prev => [newB, ...prev]);
    return newB;
  }, []);

  const freezeBanquet = useCallback((id: string) => {
    setBanquets(prev => prev.map(b => b.id === id ? { ...b, frozen: true } : b));
  }, []);

  const deleteBanquet = useCallback((id: string) => {
    setBanquets(prev => prev.filter(b => b.id !== id));
    setRecords(prev => prev.filter(r => r.banquetId !== id));
  }, []);

  const addRecord = useCallback((r: Omit<GiftRecord, 'id' | 'createdAt'>) => {
    const newR: GiftRecord = { ...r, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setRecords(prev => [newR, ...prev]);
    return newR;
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  const updateRecord = useCallback((updated: GiftRecord) => {
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
  }, []);
  const getRecords = useCallback((banquetId: string) => {
    return records.filter(r => r.banquetId === banquetId);
  }, [records]);

  const getBanquet = useCallback((id: string) => {
    return banquets.find(b => b.id === id);
  }, [banquets]);

  return { banquets, records, addBanquet, deleteBanquet, addRecord, deleteRecord, updateRecord, getRecords, getBanquet };
}
