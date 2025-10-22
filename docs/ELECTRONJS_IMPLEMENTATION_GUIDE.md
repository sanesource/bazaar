# 🏛️ Bazaar - Electron.js Implementation Guide

**Complete guide to implementing the Bazaar Indian Stock Market Dashboard using Electron.js**

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Project Structure](#-project-structure)
4. [Prerequisites](#-prerequisites)
5. [Initial Setup](#-initial-setup)
6. [Implementation Details](#-implementation-details)
   - [Main Process (Electron)](#main-process-electron)
   - [Renderer Process (UI)](#renderer-process-ui)
   - [Data Fetching Module](#data-fetching-module)
   - [UI Components](#ui-components)
   - [Styling (Windows XP Theme)](#styling-windows-xp-theme)
7. [Building & Packaging](#-building--packaging)
8. [Distribution](#-distribution)
9. [Testing](#-testing)
10. [Deployment](#-deployment)
11. [Performance Optimization](#-performance-optimization)
12. [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

**Bazaar** is a cross-platform desktop application that displays real-time Indian stock market information with a nostalgic Windows XP-style interface.

### Original Implementation

- **Framework:** Python + Tkinter
- **Size:** ~60-100 MB (executable)
- **Dependencies:** yfinance, pandas, requests

### Electron Implementation Benefits

- Modern web technologies (HTML/CSS/JavaScript)
- Better UI/UX capabilities
- Rich ecosystem (React, Vue, Tailwind options)
- Auto-updates support
- Cross-platform consistency
- Native notification support

---

## 🛠️ Technology Stack

### Core Technologies

- **Electron** (v28+): Desktop application framework
- **Node.js** (v18+): JavaScript runtime
- **HTML5/CSS3**: UI structure and styling
- **JavaScript (ES6+)**: Application logic

### Data & APIs

- **Yahoo Finance API**: Via `yahoo-finance2` npm package
- **Axios**: HTTP client for API requests
- **Node-fetch**: Alternative HTTP client

### Build & Distribution

- **electron-builder**: Packaging and distribution
- **electron-updater**: Auto-update functionality

### Optional Enhancements

- **React/Vue.js**: For complex UI components
- **Chart.js/D3.js**: For data visualization
- **Tailwind CSS**: For modern styling
- **TypeScript**: For type safety

---

## 📁 Project Structure

```
bazaar-electron/
│
├── package.json                 # Project metadata and dependencies
├── package-lock.json           # Dependency lock file
│
├── main.js                     # Electron main process (entry point)
├── preload.js                  # Preload script (security bridge)
│
├── src/
│   ├── renderer/               # Renderer process (UI)
│   │   ├── index.html         # Main HTML file
│   │   ├── styles/
│   │   │   ├── main.css       # Main styles
│   │   │   ├── winxp.css      # Windows XP theme
│   │   │   └── components.css # Component-specific styles
│   │   ├── js/
│   │   │   ├── app.js         # Main app logic
│   │   │   ├── ui-components.js   # UI section components
│   │   │   └── utils.js       # Utility functions
│   │   └── assets/
│   │       ├── icon.png       # App icon
│   │       └── logo.png       # Logo
│   │
│   ├── main/                   # Main process modules
│   │   ├── menu.js            # Application menu
│   │   └── window.js          # Window management
│   │
│   └── services/               # Backend services
│       ├── data-fetcher.js    # Data fetching logic
│       └── api-client.js      # API communication
│
├── assets/                     # Build assets
│   ├── icon.icns              # macOS icon
│   ├── icon.ico               # Windows icon
│   └── icon.png               # Linux icon
│
├── build/                      # Electron-builder config
│   └── icons/                 # Build-time icons
│
├── dist/                       # Distribution files (gitignored)
│
├── scripts/                    # Utility scripts
│   ├── build.js               # Build script
│   └── dev.js                 # Development script
│
├── docs/                       # Documentation
│   └── README.md
│
├── .gitignore
├── electron-builder.json      # Builder configuration
└── README.md                  # Project README
```

---

## ✅ Prerequisites

### Required Software

1. **Node.js** (v18.0.0 or higher)

   ```bash
   node --version  # Should be v18+
   ```

2. **npm** (v9.0.0 or higher)

   ```bash
   npm --version   # Should be v9+
   ```

3. **Git** (for version control)
   ```bash
   git --version
   ```

### Platform-Specific Requirements

#### Windows

- Windows 7 or later
- Visual Studio Build Tools (for native modules)
  ```bash
  npm install --global windows-build-tools
  ```

#### macOS

- macOS 10.12 or later
- Xcode Command Line Tools
  ```bash
  xcode-select --install
  ```

#### Linux

- Ubuntu 18.04+ or equivalent
- Build essentials
  ```bash
  sudo apt-get install build-essential
  ```

---

## 🚀 Initial Setup

### Step 1: Create Project Directory

```bash
mkdir bazaar-electron
cd bazaar-electron
```

### Step 2: Initialize Node.js Project

```bash
npm init -y
```

### Step 3: Install Dependencies

```bash
# Core dependencies
npm install electron --save-dev
npm install yahoo-finance2 axios

# Build tools
npm install electron-builder --save-dev

# Optional: For better development experience
npm install electron-reload --save-dev
npm install nodemon --save-dev
```

### Step 4: Create Directory Structure

```bash
# Unix/Linux/macOS
mkdir -p src/renderer/styles src/renderer/js src/renderer/assets
mkdir -p src/main src/services
mkdir -p assets/icons build/icons scripts docs

# Windows (PowerShell)
New-Item -ItemType Directory -Force -Path src/renderer/styles, src/renderer/js, src/renderer/assets, src/main, src/services, assets/icons, build/icons, scripts, docs
```

---

## 💻 Implementation Details

### Main Process (Electron)

#### `main.js` - Application Entry Point

```javascript
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// Keep a global reference to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: "#ECE9D8", // Windows XP beige
    icon: path.join(__dirname, "assets/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
    show: false, // Don't show until ready
  });

  // Load the index.html
  mainWindow.loadFile(path.join(__dirname, "src/renderer/index.html"));

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  // On macOS, apps typically stay active until Cmd+Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle IPC messages from renderer
ipcMain.handle("get-market-data", async (event, params) => {
  // This will be handled by the data fetcher
  const { getMarketData } = require("./src/services/data-fetcher");
  return await getMarketData(params);
});

ipcMain.handle("get-gainers-losers", async (event, params) => {
  const { getGainersLosers } = require("./src/services/data-fetcher");
  return await getGainersLosers(params);
});

ipcMain.handle("get-sectoral-data", async (event) => {
  const { getSectoralPerformance } = require("./src/services/data-fetcher");
  return await getSectoralPerformance();
});

ipcMain.handle("get-vix-data", async (event) => {
  const { getVixData } = require("./src/services/data-fetcher");
  return await getVixData();
});
```

#### `preload.js` - Security Bridge

```javascript
const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  // Market data methods
  getMarketData: (params) => ipcRenderer.invoke("get-market-data", params),
  getGainersLosers: (params) =>
    ipcRenderer.invoke("get-gainers-losers", params),
  getSectoralData: () => ipcRenderer.invoke("get-sectoral-data"),
  getVixData: () => ipcRenderer.invoke("get-vix-data"),

  // System info
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});
```

---

### Data Fetching Module

#### `src/services/data-fetcher.js`

```javascript
const yahooFinance = require("yahoo-finance2").default;

// Indian market index symbols
const INDICES = {
  NIFTY50: "^NSEI",
  BANKNIFTY: "^NSEBANK",
  SENSEX: "^BSESN",
  VIX: "^INDIAVIX",
};

// Sectoral indices
const SECTORS = {
  IT: "^CNXIT",
  Bank: "^NSEBANK",
  Auto: "^CNXAUTO",
  Pharma: "^CNXPHARMA",
  Metal: "^CNXMETAL",
  FMCG: "^CNXFMCG",
  Realty: "^CNXREALTY",
  Energy: "^CNXENERGY",
  Infra: "^CNXINFRA",
  Media: "^CNXMEDIA",
};

// Stock lists for different indices
const STOCK_LISTS = {
  NIFTY50: [
    "RELIANCE.NS",
    "TCS.NS",
    "HDFCBANK.NS",
    "INFY.NS",
    "HINDUNILVR.NS",
    "ICICIBANK.NS",
    "KOTAKBANK.NS",
    "SBIN.NS",
    "BHARTIARTL.NS",
    "ITC.NS",
    "LT.NS",
    "AXISBANK.NS",
    "ASIANPAINT.NS",
    "MARUTI.NS",
    "TITAN.NS",
    "BAJFINANCE.NS",
    "SUNPHARMA.NS",
    "WIPRO.NS",
    "ULTRACEMCO.NS",
    "NTPC.NS",
    "ONGC.NS",
    "HCLTECH.NS",
    "M&M.NS",
    "POWERGRID.NS",
    "TATAMOTORS.NS",
    "NESTLEIND.NS",
    "DIVISLAB.NS",
    "JSWSTEEL.NS",
    "TECHM.NS",
    "HINDALCO.NS",
  ],
  SENSEX: [
    "RELIANCE.NS",
    "TCS.NS",
    "HDFCBANK.NS",
    "INFY.NS",
    "ICICIBANK.NS",
    "HINDUNILVR.NS",
    "ITC.NS",
    "SBIN.NS",
    "BHARTIARTL.NS",
    "KOTAKBANK.NS",
    "LT.NS",
    "AXISBANK.NS",
    "BAJFINANCE.NS",
    "MARUTI.NS",
    "ASIANPAINT.NS",
    "SUNPHARMA.NS",
    "TITAN.NS",
    "ULTRACEMCO.NS",
    "NTPC.NS",
    "M&M.NS",
  ],
  BANKNIFTY: [
    "HDFCBANK.NS",
    "ICICIBANK.NS",
    "KOTAKBANK.NS",
    "SBIN.NS",
    "AXISBANK.NS",
    "INDUSINDBK.NS",
    "BANKBARODA.NS",
    "PNB.NS",
    "IDFCFIRSTB.NS",
    "BANDHANBNK.NS",
  ],
};

/**
 * Get data for a specific index
 * @param {string} indexName - Name of the index (NIFTY50, BANKNIFTY, SENSEX, VIX)
 * @returns {Promise<Object>} Index data
 */
async function getIndexData(indexName) {
  try {
    const symbol = INDICES[indexName];
    if (!symbol) {
      throw new Error(`Unknown index: ${indexName}`);
    }

    // Get quote data
    const quote = await yahooFinance.quote(symbol);

    // Get historical data for previous close
    const now = new Date();
    const history = await yahooFinance.historical(symbol, {
      period1: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      period2: now,
      interval: "1d",
    });

    const currentPrice = quote.regularMarketPrice || 0;
    const prevClose = quote.regularMarketPreviousClose || currentPrice;
    const change = currentPrice - prevClose;
    const changePct = (change / prevClose) * 100;

    return {
      name: indexName,
      price: currentPrice,
      change: change,
      change_pct: changePct,
      high: quote.regularMarketDayHigh || 0,
      low: quote.regularMarketDayLow || 0,
      open: quote.regularMarketOpen || 0,
      volume: quote.regularMarketVolume || 0,
      previousClose: prevClose,
    };
  } catch (error) {
    console.error(`Error fetching ${indexName}:`, error.message);
    return null;
  }
}

/**
 * Get market summary for all major indices
 * @returns {Promise<Object>} Market summary
 */
async function getMarketData() {
  try {
    const indices = ["NIFTY50", "BANKNIFTY", "SENSEX"];
    const summary = {};

    // Fetch all indices data
    const promises = indices.map((index) => getIndexData(index));
    const results = await Promise.all(promises);

    results.forEach((data, i) => {
      if (data) {
        summary[indices[i]] = data;
      }
    });

    // Determine market status
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const day = now.getDay();

    const isWeekday = day >= 1 && day <= 5;
    const marketStart = hours > 9 || (hours === 9 && minutes >= 15);
    const marketEnd = hours < 15 || (hours === 15 && minutes <= 30);

    summary.marketStatus =
      isWeekday && marketStart && marketEnd ? "OPEN" : "CLOSED";

    return summary;
  } catch (error) {
    console.error("Error fetching market data:", error);
    throw error;
  }
}

/**
 * Get top gainers and losers for a given index
 * @param {Object} params - Parameters object
 * @param {string} params.index - Index name (NIFTY50, SENSEX, BANKNIFTY)
 * @param {string} params.timePeriod - Time period (1D, 1Week, 1Month, 6Months, 1Year)
 * @param {number} params.limit - Number of stocks to return (default: 10)
 * @returns {Promise<Object>} Gainers and losers data
 */
async function getGainersLosers({
  index = "NIFTY50",
  timePeriod = "1D",
  limit = 10,
}) {
  try {
    const stocks = STOCK_LISTS[index] || STOCK_LISTS.NIFTY50;

    // Map time period to days
    const periodMap = {
      "1D": 2,
      "1Week": 7,
      "1Month": 30,
      "6Months": 180,
      "1Year": 365,
    };

    const daysAgo = periodMap[timePeriod] || 2;
    const now = new Date();
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const stockData = [];

    // Fetch data for each stock (in batches to avoid rate limiting)
    const batchSize = 10;
    for (let i = 0; i < stocks.length; i += batchSize) {
      const batch = stocks.slice(i, i + batchSize);
      const promises = batch.map(async (symbol) => {
        try {
          const history = await yahooFinance.historical(symbol, {
            period1: startDate,
            period2: now,
            interval: "1d",
          });

          if (history && history.length >= 2) {
            const current = history[history.length - 1].close;
            const previous = history[0].close;
            const changePct = ((current - previous) / previous) * 100;

            return {
              symbol: symbol.replace(".NS", ""),
              price: current,
              change_pct: changePct,
            };
          }
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error.message);
          return null;
        }
      });

      const results = await Promise.all(promises);
      stockData.push(...results.filter(Boolean));

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < stocks.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Sort by change percentage
    stockData.sort((a, b) => b.change_pct - a.change_pct);

    return {
      gainers: stockData.slice(0, limit),
      losers: stockData.slice(-limit).reverse(),
    };
  } catch (error) {
    console.error("Error fetching gainers/losers:", error);
    return { gainers: [], losers: [] };
  }
}

/**
 * Get VIX data
 * @returns {Promise<Object>} VIX data
 */
async function getVixData() {
  return await getIndexData("VIX");
}

/**
 * Calculate Fear/Greed index
 * @returns {Promise<Object>} Fear/Greed data
 */
async function getFearGreedIndex() {
  try {
    const vixData = await getVixData();
    const niftyData = await getIndexData("NIFTY50");

    if (!vixData || !niftyData) {
      return { score: 50, status: "NEUTRAL", vix: 0 };
    }

    // Simple calculation:
    // VIX < 15: Greed, VIX > 25: Fear
    // Nifty positive: +ve sentiment, negative: -ve sentiment

    const vixScore = Math.max(0, Math.min(100, (25 - vixData.price) * 2 + 50));
    let marketScore = 50 + niftyData.change_pct * 5;
    marketScore = Math.max(0, Math.min(100, marketScore));

    const finalScore = vixScore * 0.6 + marketScore * 0.4;

    let status;
    if (finalScore < 25) {
      status = "EXTREME FEAR";
    } else if (finalScore < 45) {
      status = "FEAR";
    } else if (finalScore < 55) {
      status = "NEUTRAL";
    } else if (finalScore < 75) {
      status = "GREED";
    } else {
      status = "EXTREME GREED";
    }

    return {
      score: Math.round(finalScore * 10) / 10,
      status: status,
      vix: vixData.price,
    };
  } catch (error) {
    console.error("Error calculating fear/greed:", error);
    return { score: 50, status: "NEUTRAL", vix: 0 };
  }
}

/**
 * Get sectoral performance data
 * @returns {Promise<Array>} Sectoral data
 */
async function getSectoralPerformance() {
  try {
    const sectoralData = [];

    for (const [sectorName, symbol] of Object.entries(SECTORS)) {
      try {
        const now = new Date();
        const history = await yahooFinance.historical(symbol, {
          period1: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          period2: now,
          interval: "1d",
        });

        if (history && history.length >= 2) {
          const current = history[history.length - 1].close;
          const previous = history[history.length - 2].close;
          const changePct = ((current - previous) / previous) * 100;

          sectoralData.push({
            sector: sectorName,
            price: current,
            change_pct: changePct,
          });
        }
      } catch (error) {
        console.error(`Error fetching ${sectorName}:`, error.message);
      }
    }

    // Sort by performance
    sectoralData.sort((a, b) => b.change_pct - a.change_pct);

    return sectoralData;
  } catch (error) {
    console.error("Error fetching sectoral data:", error);
    return [];
  }
}

module.exports = {
  getIndexData,
  getMarketData,
  getGainersLosers,
  getVixData,
  getFearGreedIndex,
  getSectoralPerformance,
};
```

---

### Renderer Process (UI)

#### `src/renderer/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'"
    />
    <title>Bazaar - Indian Stock Market</title>
    <link rel="stylesheet" href="styles/winxp.css" />
    <link rel="stylesheet" href="styles/main.css" />
    <link rel="stylesheet" href="styles/components.css" />
  </head>
  <body>
    <!-- Loading Overlay -->
    <div id="loading-overlay" class="loading-overlay hidden">
      <div class="loading-container">
        <div class="loading-icon">⏳</div>
        <div class="loading-text">Loading market data...</div>
        <div class="loading-subtext">
          Please wait while we fetch the latest updates
        </div>
      </div>
    </div>

    <!-- Main Container -->
    <div class="main-container">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <h1 class="header-title">
            🏛️ Bazaar - Indian Stock Market Dashboard
          </h1>
        </div>
        <div class="header-right">
          <span id="status-label" class="status-label">Loading...</span>
          <button id="refresh-btn" class="refresh-btn">🔄 Refresh Now</button>
        </div>
      </header>

      <!-- Scrollable Content Area -->
      <div class="content-wrapper">
        <div class="scrollable-content">
          <!-- Index Tickers Section -->
          <section id="tickers-section" class="section">
            <div class="section-header">
              <h2 class="section-title">📈 Index Tickers</h2>
            </div>
            <div class="section-content">
              <div id="tickers-container" class="tickers-grid">
                <!-- Ticker cards will be inserted here -->
              </div>
            </div>
          </section>

          <!-- Gainers & Losers Section -->
          <section id="gainers-losers-section" class="section">
            <div class="section-header">
              <h2 class="section-title">🔥 Top Gainers & Losers</h2>
            </div>
            <div class="section-content">
              <!-- Selector Controls -->
              <div class="selector-controls">
                <label class="selector-label">
                  <span class="label-text">Select Index:</span>
                  <select id="index-selector" class="selector-dropdown">
                    <option value="NIFTY50">NIFTY 50</option>
                    <option value="SENSEX">SENSEX 30</option>
                    <option value="BANKNIFTY">BANK NIFTY</option>
                  </select>
                </label>

                <label class="selector-label">
                  <span class="label-text">Time:</span>
                  <select id="time-selector" class="selector-dropdown">
                    <option value="1D">1 Day</option>
                    <option value="1Week">1 Week</option>
                    <option value="1Month">1 Month</option>
                    <option value="6Months">6 Months</option>
                    <option value="1Year">1 Year</option>
                  </select>
                </label>
              </div>

              <!-- Gainers & Losers Grid -->
              <div class="gainers-losers-grid">
                <div class="gainers-column">
                  <h3 class="column-title positive">🟢 Top Gainers</h3>
                  <div id="gainers-list" class="stock-list">
                    <!-- Gainers will be inserted here -->
                  </div>
                </div>

                <div class="losers-column">
                  <h3 class="column-title negative">🔴 Top Losers</h3>
                  <div id="losers-list" class="stock-list">
                    <!-- Losers will be inserted here -->
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Market Sentiment Section -->
          <section id="sentiment-section" class="section">
            <div class="section-header">
              <h2 class="section-title">😰 Market Sentiment</h2>
            </div>
            <div class="section-content">
              <div class="sentiment-grid">
                <!-- VIX Card -->
                <div class="sentiment-card">
                  <h3 class="card-title">India VIX (Volatility Index)</h3>
                  <div id="vix-value" class="card-value">--</div>
                  <div id="vix-change" class="card-change">--</div>
                </div>

                <!-- Fear/Greed Meter Card -->
                <div class="sentiment-card">
                  <h3 class="card-title">Market Greed Meter</h3>
                  <div id="greed-score" class="card-value">--</div>
                  <div id="greed-status" class="card-status">--</div>
                  <div class="meter-legend">
                    0=Extreme Fear 25=Fear 50=Neutral 75=Greed 100=Extreme Greed
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Sectoral Performance Section -->
          <section id="sectoral-section" class="section">
            <div class="section-header">
              <h2 class="section-title">🏭 Sectoral Performance</h2>
            </div>
            <div class="section-content">
              <div id="sectoral-container" class="sectoral-list">
                <!-- Sectoral bars will be inserted here -->
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Footer -->
      <footer class="footer">
        <span id="last-update-label">Last Updated: Never</span>
      </footer>
    </div>

    <!-- Scripts -->
    <script src="js/ui-components.js"></script>
    <script src="js/app.js"></script>
  </body>
</html>
```

#### `src/renderer/js/app.js`

```javascript
// Main application logic

class BazaarApp {
  constructor() {
    this.refreshInterval = 60000; // 60 seconds
    this.autoRefreshTimer = null;
    this.isRefreshing = false;

    this.initializeElements();
    this.attachEventListeners();
    this.startApp();
  }

  initializeElements() {
    // Control elements
    this.refreshBtn = document.getElementById("refresh-btn");
    this.statusLabel = document.getElementById("status-label");
    this.lastUpdateLabel = document.getElementById("last-update-label");
    this.loadingOverlay = document.getElementById("loading-overlay");

    // Selector elements
    this.indexSelector = document.getElementById("index-selector");
    this.timeSelector = document.getElementById("time-selector");

    // Content containers
    this.tickersContainer = document.getElementById("tickers-container");
    this.gainersList = document.getElementById("gainers-list");
    this.losersList = document.getElementById("losers-list");
    this.sectoralContainer = document.getElementById("sectoral-container");

    // Sentiment elements
    this.vixValue = document.getElementById("vix-value");
    this.vixChange = document.getElementById("vix-change");
    this.greedScore = document.getElementById("greed-score");
    this.greedStatus = document.getElementById("greed-status");
  }

  attachEventListeners() {
    // Refresh button
    this.refreshBtn.addEventListener("click", () => this.refreshAllData());

    // Selector changes
    this.indexSelector.addEventListener("change", () =>
      this.refreshGainersLosers()
    );
    this.timeSelector.addEventListener("change", () =>
      this.refreshGainersLosers()
    );
  }

  async startApp() {
    await this.refreshAllData();
    this.startAutoRefresh();
  }

  showLoading() {
    this.loadingOverlay.classList.remove("hidden");
    this.refreshBtn.disabled = true;
    this.statusLabel.textContent = "⏳ Refreshing data...";
  }

  hideLoading() {
    this.loadingOverlay.classList.add("hidden");
    this.refreshBtn.disabled = false;
  }

  async refreshAllData() {
    if (this.isRefreshing) return;

    this.isRefreshing = true;
    this.showLoading();

    try {
      // Refresh all sections in parallel
      await Promise.all([
        this.refreshTickers(),
        this.refreshGainersLosers(),
        this.refreshSentiment(),
        this.refreshSectoral(),
      ]);

      // Update last refresh time
      const now = new Date();
      this.lastUpdateLabel.textContent = `Last Updated: ${now.toLocaleString()}`;
      this.statusLabel.textContent = "✓ Data refreshed successfully";
    } catch (error) {
      console.error("Error refreshing data:", error);
      this.statusLabel.textContent = `❌ Error: ${error.message}`;
    } finally {
      this.isRefreshing = false;
      this.hideLoading();
    }
  }

  async refreshTickers() {
    try {
      const data = await window.api.getMarketData();
      this.tickersContainer.innerHTML = "";

      ["NIFTY50", "BANKNIFTY", "SENSEX"].forEach((index) => {
        if (data[index]) {
          const card = UIComponents.createTickerCard(data[index]);
          this.tickersContainer.appendChild(card);
        }
      });
    } catch (error) {
      console.error("Error refreshing tickers:", error);
      this.tickersContainer.innerHTML =
        '<div class="error-message">Failed to load index data</div>';
    }
  }

  async refreshGainersLosers() {
    try {
      const index = this.indexSelector.value;
      const timePeriod = this.timeSelector.value;

      // Show loading in the list containers
      this.gainersList.innerHTML =
        '<div class="loading-text">⏳ Loading...</div>';
      this.losersList.innerHTML =
        '<div class="loading-text">⏳ Loading...</div>';

      const data = await window.api.getGainersLosers({ index, timePeriod });

      // Clear loading
      this.gainersList.innerHTML = "";
      this.losersList.innerHTML = "";

      // Populate gainers
      if (data.gainers && data.gainers.length > 0) {
        data.gainers.forEach((stock) => {
          const item = UIComponents.createStockItem(stock, true);
          this.gainersList.appendChild(item);
        });
      } else {
        this.gainersList.innerHTML =
          '<div class="empty-message">No data available</div>';
      }

      // Populate losers
      if (data.losers && data.losers.length > 0) {
        data.losers.forEach((stock) => {
          const item = UIComponents.createStockItem(stock, false);
          this.losersList.appendChild(item);
        });
      } else {
        this.losersList.innerHTML =
          '<div class="empty-message">No data available</div>';
      }
    } catch (error) {
      console.error("Error refreshing gainers/losers:", error);
      this.gainersList.innerHTML =
        '<div class="error-message">Failed to load</div>';
      this.losersList.innerHTML =
        '<div class="error-message">Failed to load</div>';
    }
  }

  async refreshSentiment() {
    try {
      const vixData = await window.api.getVixData();

      if (vixData) {
        this.vixValue.textContent = vixData.price.toFixed(2);

        const change = vixData.change;
        const changePct = vixData.change_pct;
        const arrow = change >= 0 ? "▲" : "▼";
        const color = change >= 0 ? "negative" : "positive"; // VIX up is bad

        this.vixChange.textContent = `${arrow} ${Math.abs(change).toFixed(
          2
        )} (${Math.abs(changePct).toFixed(2)}%)`;
        this.vixChange.className = `card-change ${color}`;
      }

      // Get Fear/Greed from VIX calculation
      // This would need to be added to the main process
      // For now, calculate it client-side
      this.calculateFearGreed(vixData);
    } catch (error) {
      console.error("Error refreshing sentiment:", error);
      this.vixValue.textContent = "--";
      this.vixChange.textContent = "--";
    }
  }

  calculateFearGreed(vixData) {
    // Simple calculation based on VIX
    const vixPrice = vixData?.price || 20;
    let score = Math.max(0, Math.min(100, (25 - vixPrice) * 2 + 50));
    score = Math.round(score * 10) / 10;

    let status, color;
    if (score < 25) {
      status = "EXTREME FEAR";
      color = "#CC0000";
    } else if (score < 45) {
      status = "FEAR";
      color = "#FF6600";
    } else if (score < 55) {
      status = "NEUTRAL";
      color = "#FFD700";
    } else if (score < 75) {
      status = "GREED";
      color = "#90EE90";
    } else {
      status = "EXTREME GREED";
      color = "#00AA00";
    }

    this.greedScore.textContent = `${score} / 100`;
    this.greedScore.style.color = color;
    this.greedStatus.textContent = status;
    this.greedStatus.style.color = color;
  }

  async refreshSectoral() {
    try {
      const data = await window.api.getSectoralData();
      this.sectoralContainer.innerHTML = "";

      if (data && data.length > 0) {
        data.forEach((sector, index) => {
          const row = UIComponents.createSectorRow(sector, index);
          this.sectoralContainer.appendChild(row);
        });
      } else {
        this.sectoralContainer.innerHTML =
          '<div class="empty-message">No sectoral data available</div>';
      }
    } catch (error) {
      console.error("Error refreshing sectoral data:", error);
      this.sectoralContainer.innerHTML =
        '<div class="error-message">Failed to load sectoral data</div>';
    }
  }

  startAutoRefresh() {
    // Clear existing timer if any
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }

    // Set up new timer
    this.autoRefreshTimer = setInterval(() => {
      this.refreshAllData();
    }, this.refreshInterval);
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new BazaarApp();
});
```

#### `src/renderer/js/ui-components.js`

```javascript
// UI Component builders

const UIComponents = {
  /**
   * Create a ticker card element
   * @param {Object} data - Index data
   * @returns {HTMLElement} Ticker card element
   */
  createTickerCard(data) {
    const card = document.createElement("div");
    card.className = "ticker-card";

    const name = document.createElement("div");
    name.className = "ticker-name";
    name.textContent = data.name;

    const price = document.createElement("div");
    price.className = "ticker-price";
    price.textContent = data.price.toFixed(2);

    const change = document.createElement("div");
    const isPositive = data.change >= 0;
    change.className = `ticker-change ${isPositive ? "positive" : "negative"}`;
    const arrow = isPositive ? "▲" : "▼";
    change.textContent = `${arrow} ${Math.abs(data.change).toFixed(
      2
    )} (${Math.abs(data.change_pct).toFixed(2)}%)`;

    const info = document.createElement("div");
    info.className = "ticker-info";
    info.textContent = `Open: ${data.open.toFixed(
      2
    )} | High: ${data.high.toFixed(2)} | Low: ${data.low.toFixed(2)}`;

    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(change);
    card.appendChild(info);

    return card;
  },

  /**
   * Create a stock list item
   * @param {Object} stock - Stock data
   * @param {boolean} isGainer - Is this a gainer or loser
   * @returns {HTMLElement} Stock item element
   */
  createStockItem(stock, isGainer) {
    const item = document.createElement("div");
    item.className = "stock-item";

    const symbol = document.createElement("div");
    symbol.className = "stock-symbol";
    symbol.textContent = stock.symbol;

    const price = document.createElement("div");
    price.className = "stock-price";
    price.textContent = `₹${stock.price.toFixed(2)}`;

    const change = document.createElement("div");
    const changePct = stock.change_pct;
    const isPositive = changePct >= 0;
    change.className = `stock-change ${isPositive ? "positive" : "negative"}`;
    const arrow = isPositive ? "▲" : "▼";
    change.textContent = `${arrow} ${Math.abs(changePct).toFixed(2)}%`;

    item.appendChild(symbol);
    item.appendChild(price);
    item.appendChild(change);

    return item;
  },

  /**
   * Create a sector performance row
   * @param {Object} sector - Sector data
   * @param {number} index - Row index for alternating colors
   * @returns {HTMLElement} Sector row element
   */
  createSectorRow(sector, index) {
    const row = document.createElement("div");
    row.className = `sector-row ${index % 2 === 0 ? "even" : "odd"}`;

    const name = document.createElement("div");
    name.className = "sector-name";
    name.textContent = sector.sector;

    const barContainer = document.createElement("div");
    barContainer.className = "sector-bar-container";

    const barWrapper = document.createElement("div");
    barWrapper.className = "sector-bar-wrapper";

    const changePct = sector.change_pct;
    const isPositive = changePct >= 0;
    const barWidth = Math.min(Math.abs(changePct) * 60, 300);

    const bar = document.createElement("div");
    bar.className = `sector-bar ${isPositive ? "positive" : "negative"}`;
    bar.style.width = `${barWidth}px`;
    bar.style[isPositive ? "marginLeft" : "marginRight"] = "150px";

    barWrapper.appendChild(bar);
    barContainer.appendChild(barWrapper);

    const change = document.createElement("div");
    change.className = `sector-change ${isPositive ? "positive" : "negative"}`;
    const arrow = isPositive ? "▲" : "▼";
    change.textContent = `${arrow} ${Math.abs(changePct).toFixed(2)}%`;

    row.appendChild(name);
    row.appendChild(barContainer);
    row.appendChild(change);

    return row;
  },
};
```

---

### Styling (Windows XP Theme)

#### `src/renderer/styles/winxp.css`

```css
/* Windows XP Theme Variables */
:root {
  /* Colors */
  --xp-bg: #ece9d8;
  --xp-fg: #000000;
  --xp-button: #d4d0c8;
  --xp-button-hover: #e8e4d8;
  --xp-header: #0054e3;
  --xp-header-text: #ffffff;
  --xp-border: #7a96df;
  --xp-positive: #00aa00;
  --xp-negative: #cc0000;
  --xp-text-bg: #ffffff;
  --xp-gray: #666666;

  /* Typography */
  --xp-font: "Tahoma", "MS Sans Serif", Arial, sans-serif;
}

/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--xp-font);
  background-color: var(--xp-bg);
  color: var(--xp-fg);
  font-size: 11px;
  overflow: hidden;
}

/* Windows XP Button Style */
.xp-button {
  background-color: var(--xp-button);
  border: 2px outset var(--xp-button);
  border-radius: 2px;
  padding: 4px 12px;
  font-family: var(--xp-font);
  font-size: 11px;
  cursor: pointer;
  transition: background-color 0.1s;
}

.xp-button:hover {
  background-color: var(--xp-button-hover);
}

.xp-button:active {
  border-style: inset;
}

.xp-button:disabled {
  color: #999;
  cursor: not-allowed;
}

/* Windows XP Panel Style */
.xp-panel {
  background-color: var(--xp-bg);
  border: 2px groove var(--xp-button);
  border-radius: 2px;
}

.xp-panel-sunken {
  border-style: inset;
}

.xp-panel-raised {
  border-style: outset;
}

/* Windows XP Header Style */
.xp-header {
  background: linear-gradient(to right, var(--xp-header), #1084f7);
  color: var(--xp-header-text);
  padding: 8px 12px;
  font-weight: bold;
  border: 2px outset var(--xp-header);
}

/* Windows XP Dropdown Style */
.xp-dropdown {
  background-color: var(--xp-text-bg);
  border: 2px inset var(--xp-button);
  padding: 3px 5px;
  font-family: var(--xp-font);
  font-size: 11px;
  cursor: pointer;
}

.xp-dropdown:focus {
  outline: 1px dotted var(--xp-fg);
  outline-offset: -2px;
}
```

#### `src/renderer/styles/main.css`

```css
/* Main Application Styles */

.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--xp-bg);
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, var(--xp-header), #1084f7);
  color: var(--xp-header-text);
  padding: 10px 15px;
  border: 2px outset var(--xp-header);
  margin: 5px;
  flex-shrink: 0;
}

.header-title {
  font-size: 14px;
  font-weight: bold;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.status-label {
  font-size: 11px;
}

.refresh-btn {
  background-color: var(--xp-button);
  border: 2px outset var(--xp-button);
  padding: 5px 12px;
  font-family: var(--xp-font);
  font-size: 11px;
  cursor: pointer;
  border-radius: 2px;
}

.refresh-btn:hover {
  background-color: var(--xp-button-hover);
}

.refresh-btn:active {
  border-style: inset;
}

.refresh-btn:disabled {
  color: #999;
  cursor: not-allowed;
}

/* Content Wrapper */
.content-wrapper {
  flex: 1;
  overflow: hidden;
  margin: 0 5px;
}

.scrollable-content {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 5px;
}

/* Scrollbar Styling */
.scrollable-content::-webkit-scrollbar {
  width: 16px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: var(--xp-bg);
  border: 2px inset var(--xp-button);
}

.scrollable-content::-webkit-scrollbar-thumb {
  background: var(--xp-button);
  border: 2px outset var(--xp-button);
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background: var(--xp-button-hover);
}

/* Section Styles */
.section {
  background-color: var(--xp-bg);
  border: 2px groove var(--xp-button);
  margin-bottom: 10px;
}

.section-header {
  background: linear-gradient(to right, var(--xp-header), #1084f7);
  color: var(--xp-header-text);
  padding: 6px 10px;
  border-bottom: 1px solid var(--xp-border);
}

.section-title {
  font-size: 11px;
  font-weight: bold;
  margin: 0;
}

.section-content {
  padding: 15px;
  background-color: var(--xp-bg);
}

/* Footer */
.footer {
  background-color: var(--xp-bg);
  border: 2px inset var(--xp-button);
  padding: 5px 10px;
  text-align: center;
  font-size: 10px;
  color: var(--xp-gray);
  margin: 5px;
  flex-shrink: 0;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(236, 233, 216, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-overlay.hidden {
  display: none;
}

.loading-container {
  background-color: var(--xp-text-bg);
  border: 3px outset var(--xp-header);
  padding: 30px 40px;
  text-align: center;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
}

.loading-icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.loading-text {
  font-size: 13px;
  font-weight: bold;
  color: var(--xp-header);
  margin-bottom: 5px;
}

.loading-subtext {
  font-size: 10px;
  color: var(--xp-gray);
}

/* Error and Empty States */
.error-message,
.empty-message {
  text-align: center;
  padding: 20px;
  color: var(--xp-gray);
  font-size: 11px;
}

.error-message {
  color: var(--xp-negative);
}

/* Positive/Negative Colors */
.positive {
  color: var(--xp-positive);
}

.negative {
  color: var(--xp-negative);
}
```

#### `src/renderer/styles/components.css`

```css
/* Component-Specific Styles */

/* Tickers Section */
.tickers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.ticker-card {
  background-color: var(--xp-text-bg);
  border: 2px inset var(--xp-button);
  padding: 15px;
  text-align: center;
}

.ticker-name {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 8px;
}

.ticker-price {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.ticker-change {
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 8px;
}

.ticker-info {
  font-size: 9px;
  color: var(--xp-gray);
}

/* Gainers & Losers Section */
.selector-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  align-items: center;
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label-text {
  font-weight: bold;
  font-size: 11px;
}

.selector-dropdown {
  background-color: var(--xp-text-bg);
  border: 2px inset var(--xp-button);
  padding: 4px 6px;
  font-family: var(--xp-font);
  font-size: 11px;
  cursor: pointer;
  min-width: 120px;
}

.gainers-losers-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.column-title {
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}

.stock-list {
  background-color: var(--xp-text-bg);
  border: 2px inset var(--xp-button);
  max-height: 320px;
  overflow-y: auto;
}

.stock-item {
  display: grid;
  grid-template-columns: 140px 1fr 100px;
  gap: 10px;
  padding: 5px 10px;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.stock-item:nth-child(even) {
  background-color: #f8f8f8;
}

.stock-symbol {
  font-weight: bold;
  font-size: 10px;
}

.stock-price {
  font-size: 10px;
  text-align: right;
}

.stock-change {
  font-size: 10px;
  font-weight: bold;
  text-align: right;
}

/* Market Sentiment Section */
.sentiment-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.sentiment-card {
  background-color: var(--xp-text-bg);
  border: 2px inset var(--xp-button);
  padding: 20px;
  text-align: center;
}

.card-title {
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 10px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.card-change,
.card-status {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
}

.meter-legend {
  font-size: 9px;
  color: var(--xp-gray);
  margin-top: 10px;
}

/* Sectoral Performance Section */
.sectoral-list {
  background-color: var(--xp-text-bg);
  border: 2px inset var(--xp-button);
}

.sector-row {
  display: grid;
  grid-template-columns: 120px 1fr 100px;
  gap: 15px;
  padding: 8px 12px;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.sector-row.even {
  background-color: #f8f8f8;
}

.sector-name {
  font-weight: bold;
  font-size: 11px;
}

.sector-bar-container {
  position: relative;
  height: 20px;
}

.sector-bar-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.sector-bar {
  height: 10px;
  margin-top: 5px;
  border-radius: 2px;
}

.sector-bar.positive {
  background-color: var(--xp-positive);
}

.sector-bar.negative {
  background-color: var(--xp-negative);
}

.sector-change {
  font-size: 11px;
  font-weight: bold;
  text-align: right;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .tickers-grid {
    grid-template-columns: 1fr;
  }

  .gainers-losers-grid,
  .sentiment-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 📦 Building & Packaging

### `package.json` Configuration

```json
{
  "name": "bazaar-electron",
  "version": "1.0.0",
  "description": "Indian Stock Market Dashboard with Windows XP Theme",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "dev": "NODE_ENV=development electron .",
    "build": "electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux",
    "pack": "electron-builder --dir",
    "dist": "electron-builder"
  },
  "keywords": ["stock", "market", "indian", "nifty", "sensex", "trading"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1"
  },
  "dependencies": {
    "yahoo-finance2": "^2.11.1",
    "axios": "^1.6.0"
  },
  "build": {
    "appId": "com.bazaar.stockmarket",
    "productName": "Bazaar",
    "directories": {
      "output": "dist",
      "buildResources": "assets"
    },
    "files": [
      "main.js",
      "preload.js",
      "src/**/*",
      "assets/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "assets/icon.ico"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "assets/icon.icns",
      "category": "public.app-category.finance"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "assets/icon.png",
      "category": "Office;Finance"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### Building Commands

```bash
# Development mode with hot reload
npm run dev

# Build for current platform
npm run build

# Build for specific platform
npm run build:win     # Windows
npm run build:mac     # macOS
npm run build:linux   # Linux

# Create portable version (no installer)
npm run pack
```

### Build Output

After building, you'll find:

**Windows:**

- `dist/Bazaar Setup 1.0.0.exe` (installer)
- `dist/Bazaar 1.0.0.exe` (portable)

**macOS:**

- `dist/Bazaar-1.0.0.dmg` (disk image)
- `dist/Bazaar-1.0.0-mac.zip` (zip archive)

**Linux:**

- `dist/Bazaar-1.0.0.AppImage` (portable)
- `dist/bazaar_1.0.0_amd64.deb` (Debian package)

---

## 🚀 Distribution

### Windows Distribution

1. **Installer (NSIS)**

   - Professional installer experience
   - Registry entries
   - Start menu shortcuts
   - Uninstaller

2. **Portable**
   - Single .exe file
   - No installation required
   - Portable between machines

### macOS Distribution

1. **DMG Image**

   - Drag-and-drop installation
   - Professional appearance
   - Code signing (requires Apple Developer account)

2. **App Notarization** (optional)
   ```bash
   # Requires Apple Developer account
   xcrun altool --notarize-app \
     --primary-bundle-id "com.bazaar.stockmarket" \
     --username "your@email.com" \
     --password "@keychain:AC_PASSWORD" \
     --file dist/Bazaar-1.0.0.dmg
   ```

### Linux Distribution

1. **AppImage**

   - Universal Linux format
   - No installation needed
   - Works on most distributions

2. **DEB Package**

   - For Debian/Ubuntu systems
   - Integrated with package manager

3. **Snap/Flatpak** (optional)
   - Sandboxed distribution
   - Better security

---

## 🧪 Testing

### Manual Testing Checklist

```markdown
- [ ] Application launches successfully
- [ ] All indices display correctly (Nifty, Sensex, Bank Nifty)
- [ ] Gainers/Losers load for all indices
- [ ] Time period selector works (1D, 1Week, etc.)
- [ ] VIX and sentiment data displays
- [ ] Sectoral performance shows correctly
- [ ] Refresh button works
- [ ] Auto-refresh triggers after 60 seconds
- [ ] Scrolling works smoothly
- [ ] Window resizes properly (min 1000x700)
- [ ] Loading overlay appears/disappears correctly
- [ ] Error states display when network fails
- [ ] Last update timestamp updates correctly
```

### Automated Testing (Optional)

Install testing frameworks:

```bash
npm install --save-dev jest electron-mocha spectron
```

Create test file `tests/app.test.js`:

```javascript
const { Application } = require("spectron");
const path = require("path");

describe("Application launch", function () {
  this.timeout(10000);

  beforeEach(function () {
    this.app = new Application({
      path: path.join(__dirname, "..", "node_modules", ".bin", "electron"),
      args: [path.join(__dirname, "..")],
    });
    return this.app.start();
  });

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it("shows an initial window", async function () {
    const count = await this.app.client.getWindowCount();
    expect(count).toBe(1);
  });

  it("has the correct title", async function () {
    const title = await this.app.client.getTitle();
    expect(title).toBe("Bazaar - Indian Stock Market");
  });
});
```

---

## 🌐 Deployment

### GitHub Releases

1. **Create GitHub Repository**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/bazaar-electron.git
   git push -u origin main
   ```

2. **Create Release**
   - Tag version: `git tag v1.0.0`
   - Push tag: `git push origin v1.0.0`
   - Create release on GitHub
   - Upload build artifacts from `dist/`

### Auto-Update Setup

Install electron-updater:

```bash
npm install electron-updater
```

Add to `main.js`:

```javascript
const { autoUpdater } = require("electron-updater");

// Check for updates
app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on("update-available", () => {
  mainWindow.webContents.send("update-available");
});

autoUpdater.on("update-downloaded", () => {
  mainWindow.webContents.send("update-downloaded");
});
```

Configure in `package.json`:

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "yourusername",
      "repo": "bazaar-electron"
    }
  }
}
```

---

## ⚡ Performance Optimization

### 1. Code Splitting

Split large components:

```javascript
// Load heavy components on demand
async function loadChartModule() {
  const module = await import("./js/charts.js");
  return module;
}
```

### 2. Data Caching

Cache API responses:

```javascript
const cache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

async function getCachedData(key, fetchFn) {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const data = await fetchFn();
  cache.set(key, { data, timestamp: now });
  return data;
}
```

### 3. Lazy Loading

Load sections as user scrolls:

```javascript
// Intersection Observer for lazy loading
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      loadSection(entry.target);
    }
  });
});

document.querySelectorAll(".section").forEach((section) => {
  observer.observe(section);
});
```

### 4. Bundle Optimization

Minimize bundle size:

```json
{
  "build": {
    "asar": true,
    "compression": "maximum",
    "files": [
      "!node_modules/**/*",
      "node_modules/yahoo-finance2/**/*",
      "node_modules/axios/**/*"
    ]
  }
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Yahoo Finance API Rate Limiting

**Problem:** Too many requests causing failures

**Solution:**

```javascript
// Add delay between requests
async function delayedFetch(symbol, delay = 500) {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return yahooFinance.quote(symbol);
}
```

#### 2. High Memory Usage

**Problem:** Memory leaks from not clearing intervals

**Solution:**

```javascript
// Proper cleanup
app.on("before-quit", () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
  }
});
```

#### 3. Windows Defender False Positive

**Problem:** Antivirus flags electron app

**Solution:**

- Code sign your application
- Use electron-builder's signing options
- Request exclusion from antivirus vendors

#### 4. macOS "App is damaged" Error

**Problem:** Gatekeeper blocks unsigned app

**Solution:**

```bash
# Users can bypass with:
xattr -cr /Applications/Bazaar.app

# Or properly sign the app with:
codesign --deep --force --verify --verbose --sign "Developer ID" Bazaar.app
```

#### 5. Linux libgconf Error

**Problem:** Missing dependencies on Linux

**Solution:**

```bash
# Install required libraries
sudo apt-get install libgconf-2-4 libgtk-3-0
```

---

## 📚 Additional Resources

### Documentation

- [Electron Docs](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [yahoo-finance2 Docs](https://github.com/gadicc/node-yahoo-finance2)

### Similar Projects

- [GitHub Electron Samples](https://github.com/electron/simple-samples)
- [Awesome Electron](https://github.com/sindresorhus/awesome-electron)

### Tools

- [Electron Forge](https://www.electronforge.io/) - Alternative builder
- [Electron Fiddle](https://www.electronjs.org/fiddle) - Playground
- [Electron DevTools](https://chrome.google.com/webstore) - Debugging

---

## 🎯 Next Steps

### Phase 1: Basic Implementation (Week 1)

1. ✅ Set up project structure
2. ✅ Implement main and renderer processes
3. ✅ Create data fetcher module
4. ✅ Build basic UI components

### Phase 2: UI Polish (Week 2)

1. Complete Windows XP styling
2. Add loading states
3. Implement error handling
4. Add animations and transitions

### Phase 3: Features (Week 3)

1. Add charts and visualizations
2. Implement user preferences
3. Add export functionality
4. Create watchlist feature

### Phase 4: Build & Distribution (Week 4)

1. Set up electron-builder
2. Create installers for all platforms
3. Implement auto-updates
4. Publish to GitHub Releases

---

## 📝 Summary

This guide provides a complete roadmap for implementing Bazaar using Electron.js. The key advantages of this approach are:

✅ **Modern stack** with better tooling  
✅ **Cross-platform consistency** with web technologies  
✅ **Rich UI capabilities** with HTML/CSS/JavaScript  
✅ **Easy distribution** with electron-builder  
✅ **Active ecosystem** with thousands of packages  
✅ **Auto-update support** for seamless updates

### Expected Build Sizes

- **Windows:** ~80-120 MB
- **macOS:** ~90-130 MB
- **Linux:** ~80-120 MB

### Development Time Estimate

- **Basic functionality:** 1-2 weeks
- **UI polish:** 1 week
- **Testing & debugging:** 1 week
- **Build & distribution:** 2-3 days

**Total: 3-4 weeks for complete implementation**

---

## 🤝 Contributing

Feel free to contribute improvements to this implementation guide or the actual application!

---

## 📄 License

This implementation guide is provided as-is for educational and development purposes.

---

**Happy Coding! 🚀📈**
