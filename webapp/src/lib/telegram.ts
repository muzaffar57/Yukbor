/**
 * Telegram Mini App (WebApp) JS SDK'siga yengil wrapper.
 *
 * Telegram ilovasi Mini App'ni ochganda `window.Telegram.WebApp` obyektini
 * avtomatik beradi (index.html'dagi rasmiy https://telegram.org/js/telegram-web-app.js
 * skripti orqali). Agar odatiy brauzerda (Telegram tashqarisida) ochilsa, bu
 * obyekt mavjud bo'lmaydi -- shu holatni ham to'g'ri boshqaramiz (test rejimi).
 */

interface TelegramContactSent {
  status: "sent";
  response: string;
  responseUnsafe: {
    auth_date: string;
    contact: {
      first_name: string;
      last_name?: string;
      phone_number: string;
      user_id: number;
    };
    hash: string;
  };
}

interface TelegramContactCancelled {
  status: "cancelled";
}

type TelegramContactResponse = TelegramContactSent | TelegramContactCancelled;

interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramThemeParams {
  bg_color?: string;
  secondary_bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  header_bg_color?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TelegramWebAppUser };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: TelegramThemeParams;
  ready: () => void;
  expand: () => void;
  close: () => void;
  disableVerticalSwipes?: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  requestContact: (callback?: (success: boolean, response: TelegramContactResponse) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  onEvent: (event: string, handler: () => void) => void;
  offEvent: (event: string, handler: () => void) => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    show: () => void;
    hide: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export function getWebApp(): TelegramWebApp | undefined {
  return typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
}

/** initData bo'sh bo'lmasa, demak biz haqiqatan Telegram ilovasi ichidamiz. */
export function isInsideTelegram(): boolean {
  const wa = getWebApp();
  return Boolean(wa && wa.initData && wa.initData.length > 0);
}

export function getInitData(): string {
  return getWebApp()?.initData ?? "";
}

export function getTelegramUser(): TelegramWebAppUser | undefined {
  return getWebApp()?.initDataUnsafe?.user;
}

export function initTelegramWebApp() {
  const wa = getWebApp();
  if (!wa) return;
  wa.ready();
  wa.expand();
  try {
    wa.disableVerticalSwipes?.();
  } catch {
    // eski Telegram versiyalarida mavjud bo'lmasligi mumkin
  }
  applyThemeVars(wa.themeParams, wa.colorScheme);
}

function applyThemeVars(theme: TelegramThemeParams, scheme: "light" | "dark") {
  const root = document.documentElement.style;
  if (theme.bg_color) root.setProperty("--tg-bg", theme.bg_color);
  if (theme.secondary_bg_color) root.setProperty("--tg-secondary-bg", theme.secondary_bg_color);
  if (theme.text_color) root.setProperty("--tg-text", theme.text_color);
  if (theme.hint_color) root.setProperty("--tg-hint", theme.hint_color);
  if (theme.link_color) root.setProperty("--tg-link", theme.link_color);
  if (theme.button_color) root.setProperty("--tg-button", theme.button_color);
  if (theme.button_text_color) root.setProperty("--tg-button-text", theme.button_text_color);
  if (theme.header_bg_color) root.setProperty("--tg-header-bg", theme.header_bg_color);
  document.documentElement.dataset.theme = scheme;
}

export function hapticImpact(style: "light" | "medium" | "heavy" = "light") {
  try {
    getWebApp()?.HapticFeedback?.impactOccurred(style);
  } catch {
    // Telegram tashqarisida yoki qo'llab-quvvatlanmasa -- e'tiborsiz qoldiramiz.
  }
}

export function hapticNotify(type: "error" | "success" | "warning") {
  try {
    getWebApp()?.HapticFeedback?.notificationOccurred(type);
  } catch {
    // Telegram tashqarisida yoki qo'llab-quvvatlanmasa -- e'tiborsiz qoldiramiz.
  }
}

/**
 * Telegram'ning `telegram-web-app.js` skripti Telegram tashqarisida (oddiy
 * brauzerda) ochilganda ham `window.Telegram.WebApp` obyektini yaratadi
 * ("shim"), lekin uning metodlarini chaqirsak ("showPopup", "showConfirm",
 * "BackButton" va h.k.) haqiqiy Telegram mobil/desktop ilovasi bo'lmagani
 * uchun xato (`WebAppMethodUnsupported`) tashlaydi. Shuning uchun HAR BIR
 * chaqiruvni `try/catch` bilan o'raymiz va muvaffaqiyatsiz bo'lsa darhol
 * brauzer analogiga (`alert`, `confirm`) tushamiz -- aks holda funksiya
 * (masalan logout tugmasi) butunlay ishlamay qolib qoladi.
 */
export function showAlert(message: string): Promise<void> {
  const wa = getWebApp();
  return new Promise((resolve) => {
    if (wa) {
      try {
        wa.showAlert(message, () => resolve());
        return;
      } catch {
        // Telegram tashqarisida yoki eski versiyada -- brauzerga tushamiz.
      }
    }
    window.alert(message);
    resolve();
  });
}

export function showConfirm(message: string): Promise<boolean> {
  const wa = getWebApp();
  return new Promise((resolve) => {
    if (wa) {
      try {
        wa.showConfirm(message, (ok) => resolve(ok));
        return;
      } catch {
        // Telegram tashqarisida yoki eski versiyada -- brauzerga tushamiz.
      }
    }
    resolve(window.confirm(message));
  });
}

/** Telegram'ning rasmiy "kontakt ulashish" darchasini ochadi. */
export function requestPhoneContact(): Promise<{ phoneNumber: string; firstName: string } | null> {
  const wa = getWebApp();
  if (!wa) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      wa.requestContact((success, response) => {
        if (success && response.status === "sent") {
          resolve({
            phoneNumber: response.responseUnsafe.contact.phone_number,
            firstName: response.responseUnsafe.contact.first_name,
          });
        } else {
          resolve(null);
        }
      });
    } catch {
      resolve(null);
    }
  });
}

/**
 * MainButton'ni React komponentida oson boshqarish uchun hook-siz yordamchi.
 * `useMainButton` React hook'i (hooks.ts) shu funksiyalarga tayanadi.
 */
export function setMainButton(options: {
  text: string;
  onClick: () => void;
  visible?: boolean;
  enabled?: boolean;
  loading?: boolean;
}) {
  const wa = getWebApp();
  if (!wa || !isInsideTelegram()) return () => {};
  const { MainButton } = wa;
  try {
    MainButton.setText(options.text);
    MainButton.onClick(options.onClick);
    if (options.loading) {
      MainButton.showProgress(true);
    } else {
      MainButton.hideProgress();
    }
    if (options.enabled === false) {
      MainButton.disable();
    } else {
      MainButton.enable();
    }
    if (options.visible === false) {
      MainButton.hide();
    } else {
      MainButton.show();
    }
  } catch {
    return () => {};
  }
  return () => {
    try {
      MainButton.offClick(options.onClick);
    } catch {
      // e'tiborsiz qoldiramiz
    }
  };
}

export function hideMainButton() {
  try {
    getWebApp()?.MainButton.hide();
  } catch {
    // e'tiborsiz qoldiramiz
  }
}

export function setBackButton(onClick: () => void) {
  const wa = getWebApp();
  if (!wa || !isInsideTelegram()) return () => {};
  try {
    wa.BackButton.onClick(onClick);
    wa.BackButton.show();
  } catch {
    return () => {};
  }
  return () => {
    try {
      wa.BackButton.offClick(onClick);
      wa.BackButton.hide();
    } catch {
      // e'tiborsiz qoldiramiz
    }
  };
}

export function hideBackButton() {
  try {
    getWebApp()?.BackButton.hide();
  } catch {
    // e'tiborsiz qoldiramiz
  }
}
