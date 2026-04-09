/**
 * API 服务层
 * 封装所有后端 API 调用
 */

const API_BASE = '/api';

// Token 管理
class TokenStorage {
  private static TOKEN_KEY = 'auth_token';

  static get(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static set(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch {
      // ignore
    }
  }

  static remove(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch {
      // ignore
    }
  }
}

// 工具函数
async function fetchJSON<T>(url: string, options?: RequestInit) {
  const token = TokenStorage.get();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: '请求失败' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ============== 类型定义 ==============

export interface Banquet {
  id: string;
  name: string;
  date: string;
  location: string;
  type: string;
  frozen: boolean;
  created_at: string;
  deleted_at?: string;
}

export interface GiftRecord {
  id: string;
  banquet_id: string;
  guest_name: string;
  amount: number;
  gifts: string[];
  note: string;
  created_at: string;
  deleted_at?: string;
}

export interface Statistics {
  total_amount: number;
  guest_count: number;
  avg_amount: number;
  gift_types_count: number;
  top_guests: { guest_name: string; amount: number }[];
  gift_stats: { gift: string; count: number }[];
}

// ============== 宴会 API ==============

export const banquetApi = {
  /** 获取所有宴会 */
  list: () => fetchJSON<Banquet[]>(`${API_BASE}/banquets`),

  /** 获取单个宴会 */
  get: (id: string) => fetchJSON<Banquet>(`${API_BASE}/banquets/${id}`),

  /** 创建宴会 */
  create: (data: { name: string; date: string; location: string; type: string }) =>
    fetchJSON<Banquet>(`${API_BASE}/banquets`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 更新宴会 */
  update: (id: string, data: { name?: string; date?: string; location?: string; type?: string }) =>
    fetchJSON<Banquet>(`${API_BASE}/banquets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** 删除宴会 */
  delete: (id: string) =>
    fetchJSON<void>(`${API_BASE}/banquets/${id}`, { method: 'DELETE' }),

  /** 归档宴会 */
  freeze: (id: string) =>
    fetchJSON<Banquet>(`${API_BASE}/banquets/${id}/freeze`, { method: 'POST' }),
};

// ============== 礼金记录 API ==============

export const recordApi = {
  /** 获取宴会的所有记录 */
  list: (banquetId: string) =>
    fetchJSON<GiftRecord[]>(`${API_BASE}/banquets/${banquetId}/records`),

  /** 创建记录 */
  create: (banquetId: string, data: { guest_name: string; amount: number; gifts: string[]; note: string }) =>
    fetchJSON<GiftRecord>(`${API_BASE}/banquets/${banquetId}/records`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 更新记录 */
  update: (id: string, data: { guest_name?: string; amount?: number; gifts?: string[]; note?: string }) =>
    fetchJSON<GiftRecord>(`${API_BASE}/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** 删除记录 */
  delete: (id: string) =>
    fetchJSON<void>(`${API_BASE}/records/${id}`, { method: 'DELETE' }),
};

// ============== 认证 API ==============

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    username: string;
    created_at: string;
  };
}

export const authApi = {
  /** 注册 */
  register: (data: RegisterRequest) =>
    fetchJSON<{ message: string; user: { id: string; username: string; created_at: string } }>(
      `${API_BASE}/auth/register`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  /** 登录 */
  login: (data: LoginRequest) =>
    fetchJSON<TokenResponse>(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  /** 获取当前用户 */
  me: () =>
    fetchJSON<{ id: string; username: string; created_at: string }>(`${API_BASE}/auth/me`),
};

export const statisticsApi = {
  /** 获取宴会统计 */
  get: (banquetId: string) =>
    fetchJSON<Statistics>(`${API_BASE}/banquets/${banquetId}/statistics`),
};
