// Main application logic

class BazaarApp {
  constructor() {
    this.tickerRefreshInterval = 3000; // 3 seconds for tickers
    this.tickerRefreshTimer = null;
    this.isRefreshingTickers = false;

    this.initializeElements();
    this.attachEventListeners();
    this.startApp();
  }

  initializeElements() {
    this.marketStatus = document.getElementById("market-status");
    this.lastUpdateLabel = document.getElementById("last-update-label");
    this.loadingOverlay = document.getElementById("loading-overlay");

    this.indexSelector = document.getElementById("index-selector");
    this.timeSelector = document.getElementById("time-selector");

    this.tickersContainer = document.getElementById("tickers-container");
    this.gainersList = document.getElementById("gainers-list");
    this.losersList = document.getElementById("losers-list");
    this.sectoralContainer = document.getElementById("sectoral-container");

    this.vixValue = document.getElementById("vix-value");
    this.vixChange = document.getElementById("vix-change");
    this.greedScore = document.getElementById("greed-score");
    this.greedStatus = document.getElementById("greed-status");
  }

  attachEventListeners() {
    this.indexSelector.addEventListener("change", () =>
      this.refreshGainersLosers()
    );
    this.timeSelector.addEventListener("change", () =>
      this.refreshGainersLosers()
    );
  }

  async startApp() {
    // Initial load
    await this.refreshTickers();
    await this.loadInitialData();

    // Start ticker auto-refresh (every 3 seconds)
    this.startTickerAutoRefresh();
  }

  showLoading() {
    this.loadingOverlay.classList.remove("hidden");
  }

  hideLoading() {
    this.loadingOverlay.classList.add("hidden");
  }

  async loadInitialData() {
    this.showLoading();

    try {
      // Load initial data for gainers/losers, sentiment, and sectoral
      await Promise.all([
        this.refreshGainersLosers(),
        this.refreshSentiment(),
        this.refreshSectoral(),
      ]);

      const now = new Date();
      this.lastUpdateLabel.textContent = `Loaded: ${now.toLocaleString()}`;
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      this.hideLoading();
    }
  }

  async refreshTickers() {
    if (this.isRefreshingTickers) return;

    this.isRefreshingTickers = true;

    try {
      const data = await window.api.getMarketData();
      const indices = ["NIFTY50", "BANKNIFTY", "MIDCAP100", "SMALLCAP250"];

      // Check if this is first load
      const isFirstLoad = this.tickersContainer.children.length === 0;

      if (isFirstLoad) {
        // First load - create all cards
        this.tickersContainer.innerHTML = "";
        indices.forEach((index) => {
          if (data[index]) {
            const card = UIComponents.createTickerCard(data[index]);
            this.tickersContainer.appendChild(card);
          }
        });
      } else {
        // Update existing cards with animation
        indices.forEach((index) => {
          if (data[index]) {
            const existingCard = this.tickersContainer.querySelector(
              `[data-index-name="${data[index].name}"]`
            );
            if (existingCard) {
              UIComponents.updateTickerCard(existingCard, data[index]);
            } else {
              // Card doesn't exist, create it
              const card = UIComponents.createTickerCard(data[index]);
              this.tickersContainer.appendChild(card);
            }
          }
        });
      }

      // Update market status
      if (data.marketStatus) {
        const isOpen = data.marketStatus === "OPEN";
        const statusEmoji = isOpen ? "🟢" : "🔴";
        const statusText = isOpen ? "OPEN" : "CLOSED";
        this.marketStatus.textContent = `${statusEmoji} Market: ${statusText}`;
        // Using bright colors with high contrast against blue header background
        this.marketStatus.style.color = isOpen ? "#69F0AE" : "#FF8A80";
        this.marketStatus.style.fontWeight = "bold";
        this.marketStatus.style.textShadow = "1px 1px 2px rgba(0, 0, 0, 0.5)";
      }
    } catch (error) {
      console.error("Error refreshing tickers:", error);
      this.tickersContainer.innerHTML =
        '<div class="error-message">Failed to load index data</div>';
    } finally {
      this.isRefreshingTickers = false;
    }
  }

  async refreshGainersLosers() {
    try {
      const index = this.indexSelector.value;
      const timePeriod = this.timeSelector.value;

      this.gainersList.innerHTML =
        '<div class="loading-text">⏳ Loading...</div>';
      this.losersList.innerHTML =
        '<div class="loading-text">⏳ Loading...</div>';

      const data = await window.api.getGainersLosers({ index, timePeriod });

      this.gainersList.innerHTML = "";
      this.losersList.innerHTML = "";

      if (data.gainers && data.gainers.length > 0) {
        data.gainers.forEach((stock) => {
          const item = UIComponents.createStockItem(stock);
          this.gainersList.appendChild(item);
        });
      } else {
        this.gainersList.innerHTML =
          '<div class="empty-message">No data available</div>';
      }

      if (data.losers && data.losers.length > 0) {
        data.losers.forEach((stock) => {
          const item = UIComponents.createStockItem(stock);
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
        const color = change >= 0 ? "negative" : "positive";

        this.vixChange.textContent = `${arrow} ${Math.abs(change).toFixed(
          2
        )} (${Math.abs(changePct).toFixed(2)}%)`;
        this.vixChange.className = `card-change ${color}`;

        this.calculateFearGreed(vixData);
      }
    } catch (error) {
      console.error("Error refreshing sentiment:", error);
      this.vixValue.textContent = "--";
      this.vixChange.textContent = "--";
    }
  }

  calculateFearGreed(vixData) {
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

  startTickerAutoRefresh() {
    if (this.tickerRefreshTimer) {
      clearInterval(this.tickerRefreshTimer);
    }

    this.tickerRefreshTimer = setInterval(() => {
      this.refreshTickers();
    }, this.tickerRefreshInterval);
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new BazaarApp();
});
