# Yuk Tashish Platformasi — Backend MVP

O'zbekiston bo'yicha yuk tashish (logistika) platformasining backend qismi.
Yuk beruvchilar (shipper) yuk e'lonini joylashtiradi, tizim uni avtomatik
ravishda Telegram kanalga post qiladi, haydovchilar (driver) esa yo'nalish,
mashina turi va hajm bo'yicha filtrlab yuklarni ko'radi.

## Texnologiyalar

- **Backend**: Python 3.12, FastAPI
- **Ma'lumotlar bazasi**: PostgreSQL + SQLAlchemy 2.0 (async) + Alembic (migratsiya)
- **Validatsiya**: Pydantic v2
- **Autentifikatsiya**: JWT (telefon raqami + parol)
- **Telegram**: Aiogram 3.x (yangi yuklarni kanalga avto-post qilish uchun)

## Loyiha strukturasi

```
app/
  core/       — sozlamalar (.env), xavfsizlik (parol xesh, JWT)
  db/         — ma'lumotlar bazasiga ulanish
  models/     — SQLAlchemy modellari (User, Cargo, CargoPhoto) va enum'lar
  schemas/    — Pydantic sxemalar (kirish/chiqish formatlari)
  crud/       — bazaga yozish/o'qish funksiyalari
  api/v1/     — API endpointlar (auth, cargos, admin)
  services/   — Telegram xizmati, masofa hisoblash xizmati
alembic/      — DB migratsiyalari
scripts/      — administrator yaratish skripti
media/        — yuklangan rasmlar shu yerda saqlanadi
```

## Mahalliy (local) ishga tushirish

### 1. Muhitni tayyorlash

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. `.env` faylini sozlash

`.env.example` faylidan nusxa oling va o'zingizning qiymatlaringizni kiriting:

```bash
cp .env.example .env
```

`DATABASE_URL` — PostgreSQL manzili. `TELEGRAM_BOT_TOKEN` va
`TELEGRAM_CHANNEL_ID` bo'lmasa ham tizim ishlayveradi (faqat Telegram'ga
xabar yubormaydi, log yozadi).

### 3. Ma'lumotlar bazasini tayyorlash

PostgreSQL o'rnatilgan va ishga tushirilgan bo'lishi kerak. Keyin:

```bash
alembic upgrade head
```

Bu buyruq kerakli jadvallarni (`users`, `cargos`, `cargo_photos`) yaratadi.

### 4. Serverni ishga tushirish

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8742
```

Server ishga tushgandan so'ng, brauzerda oching:

- **Interaktiv hujjat (Swagger)**: `http://localhost:8742/docs` — shu yerda
  har bir API'ni tugmalar orqali sinab ko'rish mumkin, kod yozish shart emas.
- **Health-check**: `http://localhost:8742/health`

### 5. Birinchi administratorni yaratish

Obunani boshqarish uchun kamida bitta admin kerak. Avval oddiy foydalanuvchi
sifatida `/api/v1/auth/register` orqali ro'yxatdan o'tib, so'ngra:

```bash
python -m scripts.create_admin +998901234567
```

## API qisqacha

| Method | Yo'l | Vazifa |
|---|---|---|
| POST | `/api/v1/auth/register` | Ro'yxatdan o'tish |
| POST | `/api/v1/auth/login` | Kirish (JWT token olish) |
| POST | `/api/v1/cargos/` | Yangi yuk yaratish + Telegram post (faqat shipper) |
| GET | `/api/v1/cargos/` | Yuklar ro'yxati (filtr + sahifalash) |
| GET | `/api/v1/cargos/{id}` | Bitta yuk tafsiloti |
| PATCH | `/api/v1/cargos/{id}/status` | Status o'zgartirish (faqat egasi) |
| POST | `/api/v1/cargos/{id}/photos` | Yukka rasm biriktirish (faqat egasi) |
| POST | `/api/v1/admin/users/{id}/subscription/extend` | Obunani uzaytirish (faqat admin) |
| GET | `/health` | Server holatini tekshirish |

## Muhim texnik qarorlar

- **Masofa (km)** — Google/Yandex Xarita API pullik bo'lgani uchun, MVP
  bosqichida O'zbekistonning 14 ta hududi markazlari orasidagi masofa GPS
  koordinatalar asosida taxminan hisoblanadi (`app/services/distance.py`).
- **Telegram post** — agar yukda GPS koordinatasi (`loading_lat`/`loading_lon`)
  berilgan bo'lsa, postga avtomatik Yandex Xaritalar havolasi qo'shiladi.
- **Monetizatsiya** — `User.subscription_expires_at` maydoni tayyor, lekin
  hozircha barcha foydalanuvchilar cheksiz/bepul. Kelajakda faqat
  haydovchilar uchun obuna yoqiladi (yuk beruvchilar doim bepul qoladi).
- **Admin huquqi** hech qachon ochiq API orqali berilmaydi, faqat
  `scripts/create_admin.py` skripti orqali (server ichida) beriladi.
