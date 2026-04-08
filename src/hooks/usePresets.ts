import { useState, useEffect, useCallback } from 'react';

const GIFT_PRESETS_KEY = 'renqing_gift_presets';
const AMOUNT_PRESETS_KEY = 'renqing_amount_presets';

const DEFAULT_GIFTS = ['火炮', '杂糖', '白糖', '面'];
const DEFAULT_AMOUNTS = [100, 200, 300, 500, 600, 800, 1000, 1600, 2000];

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

export function usePresets() {
  const [giftPresets, setGiftPresets] = useState<string[]>(() => load(GIFT_PRESETS_KEY, DEFAULT_GIFTS));
  const [amountPresets, setAmountPresets] = useState<number[]>(() => load(AMOUNT_PRESETS_KEY, DEFAULT_AMOUNTS));

  useEffect(() => localStorage.setItem(GIFT_PRESETS_KEY, JSON.stringify(giftPresets)), [giftPresets]);
  useEffect(() => localStorage.setItem(AMOUNT_PRESETS_KEY, JSON.stringify(amountPresets)), [amountPresets]);

  const addGiftPreset = useCallback((g: string) => {
    setGiftPresets(prev => prev.includes(g) ? prev : [...prev, g]);
  }, []);

  const removeGiftPreset = useCallback((g: string) => {
    setGiftPresets(prev => prev.filter(x => x !== g));
  }, []);

  const addAmountPreset = useCallback((a: number) => {
    setAmountPresets(prev => prev.includes(a) ? prev : [...prev, a].sort((x, y) => x - y));
  }, []);

  const removeAmountPreset = useCallback((a: number) => {
    setAmountPresets(prev => prev.filter(x => x !== a));
  }, []);

  const resetGiftPresets = useCallback(() => setGiftPresets(DEFAULT_GIFTS), []);
  const resetAmountPresets = useCallback(() => setAmountPresets(DEFAULT_AMOUNTS), []);

  return {
    giftPresets, amountPresets,
    addGiftPreset, removeGiftPreset, addAmountPreset, removeAmountPreset,
    resetGiftPresets, resetAmountPresets,
  };
}
