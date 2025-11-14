const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  getMarketData: () => ipcRenderer.invoke("get-market-data"),
  getGainersLosers: (params) =>
    ipcRenderer.invoke("get-gainers-losers", params),
  getSectoralData: (params) => ipcRenderer.invoke("get-sectoral-data", params),
  getVixData: () => ipcRenderer.invoke("get-vix-data"),
  searchStocks: (query) => ipcRenderer.invoke("search-stocks", query),
  getTrendingStocks: (limit) =>
    ipcRenderer.invoke("get-trending-stocks", limit),
  getStockProfile: (symbol) => ipcRenderer.invoke("get-stock-profile", symbol),
  getStockChartData: (symbol, timePeriod) =>
    ipcRenderer.invoke("get-stock-chart-data", symbol, timePeriod),
  getStockQuote: (symbol, timePeriod) =>
    ipcRenderer.invoke("get-stock-quote", symbol, timePeriod),
  platform: process.platform,
});
