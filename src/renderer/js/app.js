// Main application logic

class BazaarApp {
  constructor() {
    this.tickerRefreshInterval = 3000; // 3 seconds for tickers
    this.gainersLosersRefreshInterval = 5000; // 5 seconds for gainers/losers
    this.tickerRefreshTimer = null;
    this.gainersLosersRefreshTimer = null;
    this.isRefreshingTickers = false;
    this.isRefreshingGainersLosers = false;
    this.isMarketOpen = false;

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
    this.filtersLoadingIcon = document.getElementById("filters-loading-icon");

    this.sectoralTimeSelector = document.getElementById(
      "sectoral-time-selector"
    );
    this.sectoralLoadingIcon = document.getElementById("sectoral-loading-icon");

    this.tickersContainer = document.getElementById("tickers-container");
    this.gainersList = document.getElementById("gainers-list");
    this.losersList = document.getElementById("losers-list");
    this.sectoralContainer = document.getElementById("sectoral-container");
    this.gainersRefreshIndicator = document.getElementById(
      "gainers-refresh-indicator"
    );

    this.vixValue = document.getElementById("vix-value");
    this.vixChange = document.getElementById("vix-change");
    this.greedScore = document.getElementById("greed-score");
    this.greedStatus = document.getElementById("greed-status");

    // Theme elements
    this.themeSelector = document.getElementById("theme-selector");
    this.body = document.body;

    // Stock search elements
    this.stockSearchInput = document.getElementById("stock-search-input");
    this.searchResults = document.getElementById("search-results");
    this.trendingStocksList = document.getElementById("trending-stocks-list");

    // Stock profile screen elements
    this.stockProfileScreen = document.getElementById("stock-profile-screen");
    this.stockProfileContent = document.getElementById("stock-profile-content");
    this.backBtn = document.getElementById("back-btn");
    this.profileTitle = document.getElementById("profile-title");
  }

  attachEventListeners() {
    this.indexSelector.addEventListener("change", () => {
      this.refreshGainersLosers();
      this.manageGainersLosersAutoRefresh();
    });
    this.timeSelector.addEventListener("change", () => {
      this.refreshGainersLosers();
      this.manageGainersLosersAutoRefresh();
    });
    this.sectoralTimeSelector.addEventListener("change", () => {
      this.refreshSectoral();
    });

    // Theme selector event listener
    this.themeSelector.addEventListener("change", () => {
      this.switchTheme(this.themeSelector.value);
    });

    // Stock search event listeners
    let searchTimeout;
    this.stockSearchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();

      // Clear previous timeout
      clearTimeout(searchTimeout);

      if (query.length === 0) {
        this.hideSearchResults();
        return;
      }

      // Debounce search
      searchTimeout = setTimeout(() => {
        this.performSearch(query);
      }, 300);
    });

    // Hide search results when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !this.stockSearchInput.contains(e.target) &&
        !this.searchResults.contains(e.target)
      ) {
        this.hideSearchResults();
      }
    });

    // Back button event listener
    this.backBtn.addEventListener("click", () => {
      this.closeStockProfile();
    });
  }

  async startApp() {
    // Initialize theme from localStorage
    this.initializeTheme();

    // Load trending stocks first (doesn't need loading overlay)
    await this.loadTrendingStocks();

    // Initial load
    await this.refreshTickers();
    await this.loadInitialData();

    // Start ticker auto-refresh (every 3 seconds)
    this.startTickerAutoRefresh();

    // Start gainers/losers auto-refresh if conditions are met
    this.manageGainersLosersAutoRefresh();
  }

  showLoading() {
    this.loadingOverlay.classList.remove("hidden");
  }

  hideLoading() {
    this.loadingOverlay.classList.add("hidden");
  }

  showFiltersLoading() {
    this.filtersLoadingIcon.classList.remove("hidden");
  }

  hideFiltersLoading() {
    this.filtersLoadingIcon.classList.add("hidden");
  }

  showSectoralLoading() {
    this.sectoralLoadingIcon.classList.remove("hidden");
  }

  hideSectoralLoading() {
    this.sectoralLoadingIcon.classList.add("hidden");
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
        this.isMarketOpen = isOpen;

        const statusEmoji = isOpen ? "🟢" : "🔴";
        const statusText = isOpen ? "OPEN" : "CLOSED";
        this.marketStatus.textContent = `${statusEmoji} Market: ${statusText}`;
        // Using bright colors with high contrast against blue header background
        this.marketStatus.style.color = isOpen ? "#69F0AE" : "#FF8A80";
        this.marketStatus.style.fontWeight = "bold";
        this.marketStatus.style.textShadow = "1px 1px 2px rgba(0, 0, 0, 0.5)";

        // Manage gainers/losers auto-refresh based on market status
        this.manageGainersLosersAutoRefresh();
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
    if (this.isRefreshingGainersLosers) return;

    this.isRefreshingGainersLosers = true;

    try {
      const index = this.indexSelector.value;
      const timePeriod = this.timeSelector.value;

      // Check if this is first load
      const isFirstLoad =
        this.gainersList.children.length === 0 ||
        this.gainersList.querySelector(".loading-text") !== null;

      if (isFirstLoad) {
        // First load - show loading
        this.gainersList.innerHTML =
          '<div class="loading-text">⏳ Loading...</div>';
        this.losersList.innerHTML =
          '<div class="loading-text">⏳ Loading...</div>';
      } else {
        // Filter change - show filters loading icon
        this.showFiltersLoading();
      }

      const data = await window.api.getGainersLosers({ index, timePeriod });

      if (isFirstLoad) {
        // First load - create all items
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
      } else {
        // Update existing items in-place (no layout shift)
        this.updateStockListInPlace(this.gainersList, data.gainers);
        this.updateStockListInPlace(this.losersList, data.losers);
      }
    } catch (error) {
      console.error("Error refreshing gainers/losers:", error);
      this.gainersList.innerHTML =
        '<div class="error-message">Failed to load</div>';
      this.losersList.innerHTML =
        '<div class="error-message">Failed to load</div>';
    } finally {
      this.isRefreshingGainersLosers = false;
      this.hideFiltersLoading();
    }
  }

  updateStockListInPlace(listElement, newStocks) {
    if (!newStocks || newStocks.length === 0) {
      return;
    }

    const existingItems = Array.from(
      listElement.querySelectorAll(".stock-item")
    );

    // Update or create items for each position
    newStocks.forEach((stock, index) => {
      const existingItem = existingItems[index];

      if (existingItem) {
        // Check if it's the same symbol
        if (existingItem.dataset.symbol === stock.symbol) {
          // Same stock, just update values
          UIComponents.updateStockItem(existingItem, stock);
        } else {
          // Different stock, replace the item
          const newItem = UIComponents.createStockItem(stock);
          listElement.replaceChild(newItem, existingItem);
        }
      } else {
        // Need to create a new item
        const newItem = UIComponents.createStockItem(stock);
        listElement.appendChild(newItem);
      }
    });

    // Remove extra items if new list is shorter
    while (listElement.children.length > newStocks.length) {
      listElement.removeChild(listElement.lastChild);
    }
  }

  async refreshSentiment() {
    try {
      const vixData = await window.api.getVixData();

      if (vixData) {
        this.vixValue.textContent = NumberFormatter.formatIndian(vixData.price);

        const change = vixData.change;
        const changePct = vixData.change_pct;
        const arrow = change >= 0 ? "▲" : "▼";
        const color = change >= 0 ? "negative" : "positive";

        this.vixChange.textContent = `${arrow} ${NumberFormatter.formatIndian(
          Math.abs(change)
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
      // Ensure the selector exists and has a value
      if (!this.sectoralTimeSelector) {
        console.error("[Sectoral] sectoralTimeSelector not found!");
        return;
      }

      const timePeriod = this.sectoralTimeSelector.value || "1D";

      // Check if this is first load
      const isFirstLoad = this.sectoralContainer.children.length === 0;

      if (!isFirstLoad) {
        // Filter change - show loading icon
        this.showSectoralLoading();
      }

      const data = await window.api.getSectoralData({ timePeriod });

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
    } finally {
      this.hideSectoralLoading();
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

  manageGainersLosersAutoRefresh() {
    const timePeriod = this.timeSelector.value;
    const shouldAutoRefresh = this.isMarketOpen && timePeriod === "1D";

    console.log(
      `[Gainers/Losers] Market Open: ${this.isMarketOpen}, Time Period: ${timePeriod}, Should Auto-Refresh: ${shouldAutoRefresh}`
    );

    if (shouldAutoRefresh) {
      // Start auto-refresh only if not already running
      if (!this.gainersLosersRefreshTimer) {
        this.startGainersLosersAutoRefresh();
        this.gainersRefreshIndicator.style.display = "inline";
        console.log("✓ Started gainers/losers auto-refresh (5s interval)");
      }
    } else {
      // Stop auto-refresh
      if (this.gainersLosersRefreshTimer) {
        clearInterval(this.gainersLosersRefreshTimer);
        this.gainersLosersRefreshTimer = null;
        this.gainersRefreshIndicator.style.display = "none";
        console.log(
          "✗ Stopped gainers/losers auto-refresh (market closed or non-1D filter)"
        );
      }
    }
  }

  startGainersLosersAutoRefresh() {
    if (this.gainersLosersRefreshTimer) {
      clearInterval(this.gainersLosersRefreshTimer);
    }

    this.gainersLosersRefreshTimer = setInterval(() => {
      console.log("[Gainers/Losers] Auto-refreshing...");
      this.refreshGainersLosers();
    }, this.gainersLosersRefreshInterval);
  }

  // Stock Search Methods
  async loadTrendingStocks() {
    try {
      const trendingStocks = await window.api.getTrendingStocks(5);

      this.trendingStocksList.innerHTML = "";

      if (trendingStocks && trendingStocks.length > 0) {
        trendingStocks.forEach((stock) => {
          const item = UIComponents.createTrendingStockItem(stock);
          item.addEventListener("click", () => {
            this.openStockProfile(stock.symbol);
          });
          this.trendingStocksList.appendChild(item);
        });
      } else {
        this.trendingStocksList.innerHTML =
          '<div class="empty-message">No trending stocks available</div>';
      }
    } catch (error) {
      console.error("Error loading trending stocks:", error);
      this.trendingStocksList.innerHTML =
        '<div class="error-message">Failed to load trending stocks</div>';
    }
  }

  async performSearch(query) {
    try {
      const results = await window.api.searchStocks(query);

      this.searchResults.innerHTML = "";

      if (results && results.length > 0) {
        results.forEach((stock) => {
          const item = UIComponents.createSearchResultItem(stock);
          item.addEventListener("click", () => {
            this.openStockProfile(stock.symbol);
            this.hideSearchResults();
            this.stockSearchInput.value = "";
          });
          this.searchResults.appendChild(item);
        });
        this.showSearchResults();
      } else {
        this.searchResults.innerHTML =
          '<div class="empty-message" style="padding: 10px; text-align: center;">No results found</div>';
        this.showSearchResults();
      }
    } catch (error) {
      console.error("Error searching stocks:", error);
      this.searchResults.innerHTML =
        '<div class="error-message" style="padding: 10px; text-align: center;">Search failed</div>';
      this.showSearchResults();
    }
  }

  showSearchResults() {
    this.searchResults.classList.remove("hidden");
  }

  hideSearchResults() {
    this.searchResults.classList.add("hidden");
  }

  async openStockProfile(symbol) {
    try {
      // Update the title to show the stock ticker
      this.profileTitle.textContent = symbol;

      // Show screen with loading state
      this.stockProfileContent.innerHTML =
        '<div class="loading-text">⏳ Loading profile...</div>';
      this.stockProfileScreen.classList.remove("hidden");

      // Fetch stock profile
      const profile = await window.api.getStockProfile(symbol);

      // Create and display profile
      const profileElement = UIComponents.createStockProfile(profile);
      this.stockProfileContent.innerHTML = "";
      this.stockProfileContent.appendChild(profileElement);
    } catch (error) {
      console.error("Error loading stock profile:", error);
      this.stockProfileContent.innerHTML =
        '<div class="error-message">Failed to load stock profile. Please try again.</div>';
    }
  }

  closeStockProfile() {
    this.stockProfileScreen.classList.add("hidden");
    this.stockProfileContent.innerHTML =
      '<div class="loading-text">⏳ Loading profile...</div>';
  }

  // Theme Management Methods
  initializeTheme() {
    // Get saved theme from localStorage or default to light
    const savedTheme = localStorage.getItem("bazaar-theme") || "light";

    // Set the theme selector value
    this.themeSelector.value = savedTheme;

    // Apply the theme
    this.switchTheme(savedTheme);
  }

  switchTheme(themeName) {
    // Remove existing theme classes
    this.body.classList.remove("theme-light", "theme-dark");

    // Add new theme class
    const themeClass = `theme-${themeName}`;
    this.body.classList.add(themeClass);

    // Save theme preference to localStorage
    localStorage.setItem("bazaar-theme", themeName);

    console.log(`Theme switched to: ${themeName}`);
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new BazaarApp();
});
