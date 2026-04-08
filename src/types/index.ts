export interface Banquet {
  id: string;
  name: string;
  date: string;
  location: string;
  type: BanquetType;
  createdAt: string;
}

export type BanquetType = '婚礼' | '满月宴' | '乔迁宴' | '寿宴' | '升学宴' | '其他';

export const BANQUET_TYPES: BanquetType[] = ['婚礼', '满月宴', '乔迁宴', '寿宴', '升学宴', '其他'];

export interface GiftRecord {
  id: string;
  banquetId: string;
  guestName: string;
  amount: number;
  gifts: string[];
  note: string;
  createdAt: string;
}

export const PRESET_GIFTS = ['火炮', '杂糖', '白糖', '面'];

export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'table' | 'card';
