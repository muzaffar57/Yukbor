# Yukbor — Telegram Mini App (frontend)

Bu papka O'zbekiston bo'yicha yuk tashish platformasining Telegram Mini
App (WebApp) qismi — foydalanuvchi Telegram bot ichida shu ilovani ochib
ishlatadi. Backend (FastAPI) haqida asosiy ma'lumot repo ildizidagi
[`../README.md`](../README.md) faylida, shu jumladan "Telegram WebApp
(frontend)" bo'limida.

## Texnologiyalar

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite` plugin orqali)
- **React Router** — sahifalar orasida navigatsiya
- **Axios** — backend API bilan aloqa
- Rasmiy **Telegram WebApp JS SDK** (`telegram-web-app.js`, `index.html`da
  ulangan) — `initData`, `MainButton`, `BackButton`, kontakt ulashish,
  haptika va tema ranglari uchun

## Loyiha strukturasi

```
src/
  lib/
    telegram.ts     — Telegram WebApp SDK'siga wrapper (xavfsiz, try/catch bilan)
    hooks.ts         — useMainButton, useBackButton React hook'lari
    api.ts           — backend bilan aloqa (axios)
    AuthContext.tsx  — autentifikatsiya holati (kirgan/kirmagan foydalanuvchi)
    format.ts        — pul, sana, masofa formatlash
  components/        — qayta ishlatiladigan UI qismlar (kartochka, tugma, forma)
  pages/              — har bir ekran (ro'yxat, tafsilot, yaratish, profil)
  types/              — backend'dagi enum va sxemalarga mos TypeScript tiplari
```

## Ishga tushirish

```bash
npm install
npm run dev
```

`http://localhost:5842` da ochiladi. Backend `http://localhost:8742` da
ishlab turishi kerak (`.env.development` shunga ishora qiladi).

## Build

```bash
npm run build   # natija: dist/
npm run preview # build qilingan versiyani sinash
```
