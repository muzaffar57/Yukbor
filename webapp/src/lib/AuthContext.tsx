import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearToken, fetchMe, getToken, mockTelegramLogin, setToken, telegramLogin } from "./api";
import { getInitData, isInsideTelegram } from "./telegram";
import type { UserOut } from "../types";
import type { TelegramProfileOut } from "./api";

interface AuthState {
  loading: boolean;
  user: UserOut | null;
  telegramProfile: TelegramProfileOut | null;
  insideTelegram: boolean;
  needsRegistration: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  completeRegistration: (accessToken: string) => Promise<void>;
  loginAsDev: (payload: {
    telegram_id: number;
    full_name?: string;
    phone_number?: string;
    role?: "shipper" | "driver";
    username?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const DEV_TELEGRAM_ID_KEY = "yukbor_dev_telegram_id";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserOut | null>(null);
  const [telegramProfile, setTelegramProfile] = useState<TelegramProfileOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const insideTelegram = useMemo(() => isInsideTelegram(), []);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const existingToken = getToken();
      if (existingToken) {
        try {
          const me = await fetchMe();
          setUser(me);
          setLoading(false);
          return;
        } catch {
          clearToken();
        }
      }

      if (insideTelegram) {
        const initData = getInitData();
        const result = await telegramLogin(initData);
        if (result.registered && result.access_token) {
          setToken(result.access_token);
          setUser(result.user);
        } else {
          setTelegramProfile(result.telegram_profile);
          setUser(null);
        }
      } else {
        // Test rejimi: Telegram tashqarisida (brauzerda) ochilgan.
        const savedDevId = localStorage.getItem(DEV_TELEGRAM_ID_KEY);
        if (savedDevId) {
          setTelegramProfile({ telegram_id: Number(savedDevId), first_name: "Test foydalanuvchi" });
        }
        setUser(null);
      }
    } catch (err) {
      console.error(err);
      setError("Tizimga kirishda xatolik yuz berdi. Sahifani qayta yuklang.");
    } finally {
      setLoading(false);
    }
  }, [insideTelegram]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const completeRegistration = useCallback(async (accessToken: string) => {
    setToken(accessToken);
    const me = await fetchMe();
    setUser(me);
    setTelegramProfile(null);
  }, []);

  const loginAsDev = useCallback(
    async (payload: {
      telegram_id: number;
      full_name?: string;
      phone_number?: string;
      role?: "shipper" | "driver";
      username?: string;
    }) => {
      localStorage.setItem(DEV_TELEGRAM_ID_KEY, String(payload.telegram_id));
      const result = await mockTelegramLogin(payload);
      await completeRegistration(result.access_token);
    },
    [completeRegistration]
  );

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(DEV_TELEGRAM_ID_KEY);
    setUser(null);
    setTelegramProfile(null);
  }, []);

  const value: AuthState = {
    loading,
    user,
    telegramProfile,
    insideTelegram,
    needsRegistration: !loading && !user,
    error,
    refresh: bootstrap,
    completeRegistration,
    loginAsDev,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth AuthProvider ichida ishlatilishi kerak");
  return ctx;
}
