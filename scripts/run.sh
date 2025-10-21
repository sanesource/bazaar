#!/bin/bash
# Quick launch script for Bazaar (Linux/macOS)

cd "$(dirname "$0")"

if ! python3 -c "import yfinance" 2>/dev/null; then
    echo "Dependencies not installed. Running setup..."
    ./setup.sh
    echo ""
fi

echo "🏛️  Launching Bazaar..."
python3 ../main.py

