const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

// Disable GPU acceleration on Linux to avoid sandbox issues
if (process.platform === "linux") {
  app.disableHardwareAcceleration();
}

// Keep a global reference to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: "#ECE9D8",
    icon: path.join(__dirname, "assets/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
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
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle IPC messages from renderer
ipcMain.handle("get-market-data", async () => {
  const { getMarketData } = require("./src/services/data-fetcher");
  return await getMarketData();
});

ipcMain.handle("get-gainers-losers", async (event, params) => {
  const { getGainersLosers } = require("./src/services/data-fetcher");
  return await getGainersLosers(params);
});

ipcMain.handle("get-sectoral-data", async (event, params) => {
  const { getSectoralPerformance } = require("./src/services/data-fetcher");
  return await getSectoralPerformance(params?.timePeriod || "1D");
});

ipcMain.handle("get-vix-data", async () => {
  const { getVixData } = require("./src/services/data-fetcher");
  return await getVixData();
});

ipcMain.handle("search-stocks", async (event, query) => {
  const { searchStocks } = require("./src/services/data-fetcher");
  return await searchStocks(query);
});

ipcMain.handle("get-trending-stocks", async (event, limit) => {
  const { getTrendingStocks } = require("./src/services/data-fetcher");
  return await getTrendingStocks(limit);
});

ipcMain.handle("get-stock-profile", async (event, symbol) => {
  const { getStockProfile } = require("./src/services/data-fetcher");
  return await getStockProfile(symbol);
});
