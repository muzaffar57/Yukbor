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

## Ishga tushirish — Docker orqali (tavsiya etiladi)

Bu usul eng oson: Python, PostgreSQL o'rnatish shart emas, hammasi Docker
ichida avtomatik ishlaydi. Kompyuterda faqat [Docker Desktop](https://www.docker.com/products/docker-desktop/)
o'rnatilgan bo'lishi kerak.

### 1. `.env` faylini tayyorlash

```bash
cp .env.example .env
```

Xohlasangiz, `.env` faylini ochib `SECRET_KEY`, `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHANNEL_ID` qiymatlarini o'zgartiring (bo'lmasa ham ishlayveradi,
standart qiymatlar bilan).

### 2. Qurish va ishga tushirish

```bash
docker compose build
docker compose up -d
```

Bu bitta buyruq bilan **PostgreSQL** va **backend serveri** ikkisi ham
ishga tushadi (birinchi marta bazani migratsiya qilib, keyin serverni
ko'taradi).

### 3. Tekshirish

```bash
docker compose ps          # ikkala konteyner ham "Up" bo'lishi kerak
docker compose logs -f api # server loglarini ko'rish (Ctrl+C bilan chiqish)
```

Brauzerda oching: **http://localhost:8742/docs**

### 4. To'xtatish / tozalash

```bash
docker compose down        # to'xtatish (ma'lumotlar saqlanadi)
docker compose down -v     # to'xtatish + bazani butunlay tozalash
```

### Birinchi administratorni yaratish (Docker orqali)

```bash
docker compose exec api python -m scripts.create_admin +998901234567
```

## Railway'ga joylashtirish

1. Railway'da yangi loyiha yaratib, shu repo'ni ulaymiz -- Railway avtomatik
   ravishda ildizdagi `Dockerfile`ni topib, undan foydalanadi (`docker-compose.yml`
   Railway'da ishlatilmaydi, chunki Railway har bir xizmatni alohida boshqaradi).
2. Railway'dan **"Add PostgreSQL"** orqali baza xizmatini qo'shamiz -- Railway
   avtomatik ravishda `DATABASE_URL` muhit o'zgaruvchisini beradi (kodimiz uni
   avtomatik to'g'ri formatga o'giradi, qo'lda o'zgartirish shart emas).
3. Backend xizmatiga quyidagi muhit o'zgaruvchilarini qo'shamiz: `SECRET_KEY`
   (uzun, tasodifiy qiymat), `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`.
4. Railway `PORT` o'zgaruvchisini o'zi avtomatik beradi -- `Dockerfile`
   ichidagi buyruq shuni hisobga oladi, qo'shimcha sozlash kerak emas.

## Mahalliy (local, Docker'siz) ishga tushirish

Agar Docker o'rnatilmagan bo'lsa, quyidagi usul bilan ham ishga tushirish mumkin:

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
| POST | `/api/v1/driver-offers/` | Bo'sh transport e'loni yaratish + Telegram post (faqat driver) |
| GET | `/api/v1/driver-offers/` | Bo'sh transportlar ro'yxati (filtr + sahifalash) |
| GET | `/api/v1/driver-offers/{id}` | Bitta e'lon tafsiloti |
| PATCH | `/api/v1/driver-offers/{id}/status` | E'lon statusini o'zgartirish (faqat egasi) |
| POST | `/api/v1/admin/users/{id}/subscription/extend` | Obunani uzaytirish (faqat admin) |
| GET | `/health` | Server holatini tekshirish |

## "Lahtak/qisman yuk" va "Bo'sh transport" tizimi

Real logistikada ko'p uchraydigan holat: haydovchining mashinasida bo'sh joy
bor va u boshqa (kichik/qisman) yuklarni ham qo'shib olishni xohlaydi.
Buning uchun ikki tomonlama funksiya qo'shildi:

- **`Cargo.load_type`** — yuk beruvchi o'z yukini `toliq_mashina` (butun
  mashina kerak) yoki `qisman_yuk`/lahtak (boshqa yuk bilan bo'lishish
  mumkin) deb belgilaydi.
- **`DriverOffer`** — haydovchi o'zi "bo'sh transport" e'lon qiladi: qayerdan
  qayerga ketayotgani (manzil ixtiyoriy — bo'sh qoldirilsa "istalgan
  yo'nalish" degani), mashinasida qancha bo'sh joy (kg/m3) borligi, qachon
  jo'nayotgani. Bu e'lon ham avtomatik Telegram kanalga
  "🚛 BO'SH TRANSPORT (LAHTAK)" belgisi bilan post qilinadi. Yuk beruvchilar
  shu ro'yxatni ko'rib, o'ziga mos haydovchini topadi.

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
