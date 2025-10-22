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
    this.refreshBtn = document.getElementById("refresh-btn");
    this.statusLabel = document.getElementById("status-label");
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
    this.refreshBtn.addEventListener("click", () => this.refreshAllData());
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
      await Promise.all([
        this.refreshTickers(),
        this.refreshGainersLosers(),
        this.refreshSentiment(),
        this.refreshSectoral(),
      ]);

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

      ["NIFTY50", "BANKNIFTY", "MIDCAP100", "SMALLCAP250"].forEach((index) => {
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

  startAutoRefresh() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }

    this.autoRefreshTimer = setInterval(() => {
      this.refreshAllData();
    }, this.refreshInterval);
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new BazaarApp();
});
