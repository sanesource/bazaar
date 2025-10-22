# 🚀 Bazaar - Quick Start Guide

Get the Bazaar stock market dashboard running in just 3 steps!

## Prerequisites

- **Node.js v18+** - [Download here](https://nodejs.org/)
- **npm v9+** (comes with Node.js)

## Quick Setup

### Option 1: Automated Setup (Recommended)

#### Linux/macOS:

```bash
./scripts/setup.sh
npm start
```

#### Windows:

```bash
scripts\setup.bat
npm start
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Run the application
npm start
```

## That's It! 🎉

The application will open automatically and start fetching market data.

## What You'll See

- **Index Tickers** - Nifty50, Bank Nifty, Sensex
- **Top Gainers & Losers** - Best and worst performing stocks
- **Market Sentiment** - VIX and Fear/Greed meter
- **Sectoral Performance** - How different sectors are performing

## Features

- ⚡ **Auto-refresh** every 60 seconds
- 🔄 **Manual refresh** button
- 📊 **Index filter** for gainers/losers
- ⏱️ **Time period filter** (1D, 1Week, 1Month, 6Months, 1Year)
- 🎨 **Windows XP nostalgic theme**

## Troubleshooting

### "Node.js is not installed"

Download and install Node.js v18+ from [nodejs.org](https://nodejs.org/)

### "Dependencies not installed"

Run the setup script again:

```bash
./scripts/setup.sh    # Linux/macOS
scripts\setup.bat     # Windows
```

### Data not loading

- Check your internet connection
- Wait a few seconds - Yahoo Finance API might be slow
- Click the "Refresh Now" button

### Application won't start

1. Delete `node_modules` folder
2. Run setup again
3. Try `npm start`

## Building Executables

Want a standalone app? Build it:

```bash
# For your current platform
npm run build

# For specific platform
npm run build:win     # Windows
npm run build:mac     # macOS
npm run build:linux   # Linux
```

Executables will be in the `dist/` folder.

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [docs/FEATURES.md](docs/FEATURES.md) for detailed features
- See [docs/ELECTRONJS_IMPLEMENTATION_GUIDE.md](docs/ELECTRONJS_IMPLEMENTATION_GUIDE.md) for technical details

---

**Enjoy tracking the markets! 📈💰**
