import axios, { AxiosError } from "axios";
import type {
  CargoCreatePayload,
  CargoListOut,
  CargoOut,
  CargoStatus,
  DriverOfferCreatePayload,
  DriverOfferListOut,
  DriverOfferOut,
  LoadType,
  Region,
  UserOut,
  VehicleType,
} from "../types";

export const API_BASE_URL: string = import.meta.env.VITE_API_URL || "http://localhost:8742";
const TOKEN_STORAGE_KEY = "yukbor_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export const api = axios.create({ baseURL: `${API_BASE_URL}/api/v1` });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    if (error.message === "Network Error") {
      return "Serverga ulanib bo'lmadi. Internetni tekshirib qayta urinib ko'ring.";
    }
  }
  return "Kutilmagan xatolik yuz berdi. Qayta urinib ko'ring.";
}

// ---------- Auth ----------

export interface TelegramProfileOut {
  telegram_id: number;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  photo_url?: string | null;
}

export interface TelegramLoginResult {
  registered: boolean;
  access_token: string | null;
  token_type: string;
  user: UserOut | null;
  telegram_profile: TelegramProfileOut | null;
}

export async function telegramLogin(initData: string): Promise<TelegramLoginResult> {
  const { data } = await api.post<TelegramLoginResult>("/auth/telegram/login", { init_data: initData });
  return data;
}

export async function telegramRegister(payload: {
  init_data: string;
  full_name: string;
  phone_number: string;
  role: "shipper" | "driver";
}): Promise<{ access_token: string; token_type: string }> {
  const { data } = await api.post("/auth/telegram/register", payload);
  return data;
}

export async function mockTelegramLogin(payload: {
  telegram_id: number;
  first_name?: string;
  username?: string;
  full_name?: string;
  phone_number?: string;
  role?: "shipper" | "driver";
}): Promise<{ access_token: string; token_type: string }> {
  const { data } = await api.post("/auth/telegram/mock-login", payload);
  return data;
}

export async function fetchMe(): Promise<UserOut> {
  const { data } = await api.get<UserOut>("/auth/me");
  return data;
}

// ---------- Cargos ----------

export interface CargoFilters {
  loading_region?: Region;
  unloading_region?: Region;
  vehicle_type?: VehicleType;
  load_type?: LoadType;
  limit?: number;
  offset?: number;
}

export async function fetchCargos(filters: CargoFilters = {}): Promise<CargoListOut> {
  const { data } = await api.get<CargoListOut>("/cargos/", { params: filters });
  return data;
}

export async function fetchCargo(id: number): Promise<CargoOut> {
  const { data } = await api.get<CargoOut>(`/cargos/${id}`);
  return data;
}

export async function fetchMyCargos(): Promise<CargoOut[]> {
  const { data } = await api.get<CargoOut[]>("/cargos/mine");
  return data;
}

export async function createCargo(payload: CargoCreatePayload): Promise<CargoOut> {
  const { data } = await api.post<CargoOut>("/cargos/", payload);
  return data;
}

export async function uploadCargoPhotos(cargoId: number, files: File[]): Promise<void> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  await api.post(`/cargos/${cargoId}/photos`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function updateCargoStatus(id: number, status: CargoStatus): Promise<CargoOut> {
  const { data } = await api.patch<CargoOut>(`/cargos/${id}/status`, { status });
  return data;
}

// ---------- Driver offers ----------

export interface DriverOfferFilters {
  departure_region?: Region;
  destination_region?: Region;
  vehicle_type?: VehicleType;
  load_type?: LoadType;
  limit?: number;
  offset?: number;
}

export async function fetchDriverOffers(filters: DriverOfferFilters = {}): Promise<DriverOfferListOut> {
  const { data } = await api.get<DriverOfferListOut>("/driver-offers/", { params: filters });
  return data;
}

export async function fetchDriverOffer(id: number): Promise<DriverOfferOut> {
  const { data } = await api.get<DriverOfferOut>(`/driver-offers/${id}`);
  return data;
}

export async function fetchMyDriverOffers(): Promise<DriverOfferOut[]> {
  const { data } = await api.get<DriverOfferOut[]>("/driver-offers/mine");
  return data;
}

export async function createDriverOffer(payload: DriverOfferCreatePayload): Promise<DriverOfferOut> {
  const { data } = await api.post<DriverOfferOut>("/driver-offers/", payload);
  return data;
}

export async function updateDriverOfferStatus(id: number, status: CargoStatus): Promise<DriverOfferOut> {
  const { data } = await api.patch<DriverOfferOut>(`/driver-offers/${id}/status`, { status });
  return data;
}
