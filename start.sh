#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo "Starting MALE UAV Digital Twin Platform..."
if [ -f "backend/.venv/bin/python" ]; then
    backend/.venv/bin/python run.py
elif [ -f ".venv/bin/python" ]; then
    .venv/bin/python run.py
else
    python3 run.py
fi
