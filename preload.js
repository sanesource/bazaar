const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  getMarketData: () => ipcRenderer.invoke("get-market-data"),
  getGainersLosers: (params) =>
    ipcRenderer.invoke("get-gainers-losers", params),
  getSectoralData: () => ipcRenderer.invoke("get-sectoral-data"),
  getVixData: () => ipcRenderer.invoke("get-vix-data"),
  platform: process.platform,
});
