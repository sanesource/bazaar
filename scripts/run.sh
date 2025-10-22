#!/bin/bash

echo "🏛️ Starting Bazaar..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed. Please run setup.sh first."
    exit 1
fi

npm start
