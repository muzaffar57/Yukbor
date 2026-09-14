# Yuk Tashish Platformasi -- backend (FastAPI) uchun ishlab chiqarish image'i.
# Lokalda docker-compose bilan, Railway'da esa to'g'ridan-to'g'ri shu Dockerfile
# orqali ishlaydi.

FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# curl -- health-check uchun, gcc -- ba'zi Python paketlarini kompilyatsiya
# qilish uchun kerak bo'lishi mumkin (masalan argon2-cffi).
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

RUN mkdir -p media

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Konteyner ishga tushganda: avval DB migratsiyalarini qo'llaydi, keyin serverni ko'taradi.
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
