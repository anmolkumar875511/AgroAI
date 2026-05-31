#!/usr/bin/env bash
# AgroAI Backend — Quick Start Script
set -e

echo "🌿 AgroAI Backend Startup"
echo "─────────────────────────"

# Copy .env if missing
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ Created .env from .env.example (edit SECRET_KEY before deploying)"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt -q

# Optional: train ML model if pickles missing
if [ ! -f models_pkl/agroai_visit_priority_regressor.pkl ]; then
    echo "🤖 Training ML priority model..."
    python scripts/train_model.py
fi

echo ""
echo "🚀 Starting server on http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo "   Demo login: amit@agroai.com / password123"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
