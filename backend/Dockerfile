# ── AgroAI Backend — Production Dockerfile ───────────────────────────────────
FROM python:3.12-slim AS base

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Dependencies layer (cached) ───────────────────────────────────────────────
FROM base AS deps
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ── Runtime image ─────────────────────────────────────────────────────────────
FROM deps AS runtime
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos "" agroai && \
    chown -R agroai:agroai /app
USER agroai

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
