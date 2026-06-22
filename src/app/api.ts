import axios from 'axios';

// ── Base URL ─────────────────────────────────────────────────────────────────

export const BASE_URL = 'http://localhost:3000';

// ── Axios Instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — unwrap { data } envelope, throw on error
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.data?.message || err.message;
    return Promise.reject(new Error(msg));
  }
);

// ── Types ─────────────────────────────────────────────────────────────────────

export type FrequencyType = 'DAYS' | 'TIMES_PER_DAY';

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  plantCount: number;
  createdAt: string;
}

export interface Plant {
  id: number;
  name: string;
  species: string;
  frequency: number;
  frequencyType: FrequencyType;
  image: string | null;
  lastWatered: string | null;
  createdAt: string;
  historyCount: number;
  todayCount?: number;
}

export interface PlantDetail extends Plant {
  userId: string;
  history: WaterLog[];
}

export interface WaterLog {
  id: string;
  date: string;
}

export interface CalendarDay {
  id: number;
  name: string;
  image: string | null;
  count: number;
}

export interface CalendarResponse {
  year: string;
  month: string;
  data: Record<string, CalendarDay[]>;
  summary?: {
    totalWaterings: number;
    totalPlants: number;
    activeDays: number;
  };
}

export interface AddPlantPayload {
  name: string;
  species: string;
  frequency: number;
  frequencyType: FrequencyType;
  image?: string;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string;
  user: User;
}

/** 微信登录（mock: any code works） */
export const authLogin = (code: string) =>
  api.post<LoginResponse>('/api/auth/wechat/login', { code }).then((r) => r.data);

/** 获取当前用户信息 */
export const authMe = () =>
  api.get<User>('/api/auth/me').then((r) => r.data);

// ── Plants ───────────────────────────────────────────────────────────────────

/** 获取植物列表 */
export const getPlantList = () =>
  api.get<Plant[]>('/api/plants/list').then((r) => r.data);

/** 获取植物详情（含浇水历史） */
export const getPlantInfo = (id: number) =>
  api.get<PlantDetail>(`/api/plants/info/${id}`).then((r) => r.data);

/** 添加新植物 */
export const addPlant = (payload: AddPlantPayload) =>
  api.post<Plant>('/api/plants/add', payload).then((r) => r.data);

/** 更新植物信息（所有字段可选） */
export const updatePlant = (id: number, payload: Partial<AddPlantPayload>) =>
  api.post<Plant>(`/api/plants/update/${id}`, payload).then((r) => r.data);

/** 删除植物 */
export const deletePlant = (id: number) =>
  api.post<{ success: boolean }>(`/api/plants/delete/${id}`).then((r) => r.data);

// ── Water Logs ────────────────────────────────────────────────────────────────

/** 记录浇水 */
export const addWaterLog = (plantId: number) =>
  api.post<WaterLog>('/api/water-logs/add', { plantId }).then((r) => r.data);

/** 获取日历视图 */
export const getCalendar = (year: number, month: number) =>
  api
    .get<CalendarResponse>('/api/water-logs/calendar', { params: { year, month } })
    .then((r) => r.data);

/** 获取植物浇水历史 */
export const getPlantWaterLogs = (plantId: number) =>
  api.get<WaterLog[]>(`/api/water-logs/plant/${plantId}`).then((r) => r.data);



// ── Upload ─────────────────────────────────────────────────────────────────────

export interface UploadResponse {
  url: string;
}

/** 上传植物图片，返回 URL */
export const uploadImage = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post<UploadResponse>('/api/upload/image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function daysUntilNextWater(plant: Plant): number {
  if (!plant.lastWatered) return 0;
  if (plant.frequencyType === 'TIMES_PER_DAY') return 0;
  const last = new Date(plant.lastWatered).getTime();
  const next = last + plant.frequency * 86400000;
  const diff = Math.ceil((next - Date.now()) / 86400000);
  return Math.max(0, diff);
}

export function formatNextWatering(plant: Plant): string {
  if (plant.frequencyType === 'TIMES_PER_DAY') {
    const remaining = plant.frequency - (plant.todayCount ?? 0);
    if (remaining > 0) return `今天还需浇 ${remaining} 次`;
    return '下次浇水：明天';
  }

  const days = daysUntilNextWater(plant);
  if (days === 0) return '下次浇水：今天';
  if (days === 1) return '下次浇水：明天';
  return `下次浇水：${days} 天后`;
}

export function formatLastWatered(iso: string | null): string {
  if (!iso) return '从未';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return '今天';
  if (diff === 1) return '昨天';
  return `${diff} 天前`;
}
