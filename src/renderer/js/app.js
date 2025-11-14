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

    // Watchlist elements
    this.createWatchlistBtn = document.getElementById("create-watchlist-btn");
    this.watchlistTabs = document.getElementById("watchlist-tabs");
    this.watchlistContent = document.getElementById("watchlist-content");

    // Watchlist modal elements
    this.createWatchlistModal = document.getElementById(
      "create-watchlist-modal"
    );
    this.watchlistNameInput = document.getElementById("watchlist-name-input");
    this.closeCreateModal = document.getElementById("close-create-modal");
    this.cancelCreateModal = document.getElementById("cancel-create-modal");
    this.confirmCreateModal = document.getElementById("confirm-create-modal");

    // Watchlist data
    this.watchlists = this.loadWatchlists();
    this.activeWatchlistId = null;
    this.watchlistRefreshTimer = null;
    this.watchlistRefreshInterval = 10000; // 10 seconds
    this.watchlistSearchTimeouts = {}; // Track search timeouts per watchlist
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

    // Watchlist event listeners
    this.createWatchlistBtn.addEventListener("click", () => {
      this.showCreateWatchlistModal();
    });

    // Modal event listeners
    this.closeCreateModal.addEventListener("click", () => {
      this.hideCreateWatchlistModal();
    });

    this.cancelCreateModal.addEventListener("click", () => {
      this.hideCreateWatchlistModal();
    });

    this.confirmCreateModal.addEventListener("click", () => {
      this.confirmCreateWatchlist();
    });

    // Enter key in modal input
    this.watchlistNameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.confirmCreateWatchlist();
      }
    });

    // Close modal on overlay click
    this.createWatchlistModal.addEventListener("click", (e) => {
      if (e.target === this.createWatchlistModal) {
        this.hideCreateWatchlistModal();
      }
    });

    // Watchlist tabs delegation
    this.watchlistTabs.addEventListener("click", (e) => {
      if (e.target.classList.contains("watchlist-tab-close")) {
        const tab = e.target.closest(".watchlist-tab");
        const watchlistId = tab.dataset.watchlistId;
        this.deleteWatchlist(watchlistId);
      } else if (e.target.closest(".watchlist-tab")) {
        const tab = e.target.closest(".watchlist-tab");
        const watchlistId = tab.dataset.watchlistId;
        this.switchWatchlist(watchlistId);
      }
    });

    // Watchlist content delegation
    this.watchlistContent.addEventListener("click", (e) => {
      if (e.target.classList.contains("watchlist-stock-remove")) {
        const symbol = e.target.dataset.symbol;
        const watchlistId = e.target.closest(".watchlist-stocks-container")
          .dataset.watchlistId;
        this.removeStockFromWatchlist(watchlistId, symbol);
      } else if (e.target.classList.contains("watchlist-action-btn")) {
        const watchlistId = e.target.closest(".watchlist-stocks-container")
          .dataset.watchlistId;
        if (e.target.textContent === "Rename") {
          this.renameWatchlist(watchlistId);
        }
      } else if (e.target.classList.contains("add-stock-btn")) {
        const watchlistId = e.target.dataset.watchlistId;
        const input = this.watchlistContent.querySelector(
          `.add-stock-input[data-watchlist-id="${watchlistId}"]`
        );
        if (input) {
          const symbol = input.value.trim();
          if (symbol) {
            this.addStockToWatchlist(watchlistId, symbol);
            input.value = "";
            this.hideWatchlistSearchResults(watchlistId);
          }
        }
      } else if (e.target.classList.contains("watchlist-stock-item")) {
        const symbol = e.target.dataset.symbol;
        this.openStockProfile(symbol);
      }
    });

    // Watchlist search input - search as you type
    this.watchlistContent.addEventListener("input", (e) => {
      if (e.target.classList.contains("add-stock-input")) {
        const watchlistId = e.target.dataset.watchlistId;
        const query = e.target.value.trim();

        // Clear previous timeout
        if (this.watchlistSearchTimeouts[watchlistId]) {
          clearTimeout(this.watchlistSearchTimeouts[watchlistId]);
        }

        if (query.length === 0) {
          this.hideWatchlistSearchResults(watchlistId);
          return;
        }

        // Debounce search
        this.watchlistSearchTimeouts[watchlistId] = setTimeout(() => {
          this.searchStocksForWatchlist(watchlistId, query);
        }, 300);
      }
    });

    // Watchlist search results click
    this.watchlistContent.addEventListener("click", (e) => {
      if (e.target.closest(".watchlist-search-result-item")) {
        const item = e.target.closest(".watchlist-search-result-item");
        const symbol = item.dataset.symbol;
        const watchlistId = item.closest(".watchlist-stocks-container").dataset
          .watchlistId;
        const input = this.watchlistContent.querySelector(
          `.add-stock-input[data-watchlist-id="${watchlistId}"]`
        );
        if (input) {
          input.value = "";
          this.hideWatchlistSearchResults(watchlistId);
        }
        this.addStockToWatchlist(watchlistId, symbol);
      }
    });

    // Hide search results when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".watchlist-search-wrapper")) {
        const searchInputs =
          this.watchlistContent.querySelectorAll(".add-stock-input");
        searchInputs.forEach((input) => {
          const watchlistId = input.dataset.watchlistId;
          this.hideWatchlistSearchResults(watchlistId);
        });
      }
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

    // Initialize watchlists
    this.renderWatchlists();
    this.startWatchlistAutoRefresh();
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
            item.addEventListener("click", () => {
              this.openStockProfile(stock.symbol);
            });
            this.gainersList.appendChild(item);
          });
        } else {
          this.gainersList.innerHTML =
            '<div class="empty-message">No data available</div>';
        }

        if (data.losers && data.losers.length > 0) {
          data.losers.forEach((stock) => {
            const item = UIComponents.createStockItem(stock);
            item.addEventListener("click", () => {
              this.openStockProfile(stock.symbol);
            });
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
          newItem.addEventListener("click", () => {
            this.openStockProfile(stock.symbol);
          });
          listElement.replaceChild(newItem, existingItem);
        }
      } else {
        // Need to create a new item
        const newItem = UIComponents.createStockItem(stock);
        newItem.addEventListener("click", () => {
          this.openStockProfile(stock.symbol);
        });
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

      // Show screen with enhanced loading state
      this.stockProfileContent.innerHTML = `
        <div class="stock-profile-loading">
          <div class="loading-spinner"></div>
          <div class="loading-text">Loading ${symbol} profile...</div>
          <div style="font-size: 10px; color: var(--xp-gray); margin-top: 8px;">
            Fetching market data and financial metrics
          </div>
        </div>
      `;
      this.stockProfileScreen.classList.remove("hidden");

      // Fetch stock profile
      const profile = await window.api.getStockProfile(symbol);

      // Create and display profile
      const profileElement = UIComponents.createStockProfile(profile);
      this.stockProfileContent.innerHTML = "";
      this.stockProfileContent.appendChild(profileElement);
    } catch (error) {
      console.error("Error loading stock profile:", error);
      this.stockProfileContent.innerHTML = `
        <div class="stock-profile-error">
          <strong>⚠️ Failed to load stock profile</strong><br>
          <div style="margin-top: 8px; font-size: 11px;">
            ${
              error.message ||
              "Please check your internet connection and try again."
            }
          </div>
          <button onclick="window.location.reload()" style="margin-top: 12px; padding: 6px 12px; background: var(--xp-button); border: 1px solid var(--xp-border); cursor: pointer;">
            Retry
          </button>
        </div>
      `;
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

  // Watchlist Management Methods
  loadWatchlists() {
    try {
      const saved = localStorage.getItem("bazaar-watchlists");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading watchlists:", error);
      return [];
    }
  }

  saveWatchlists() {
    try {
      localStorage.setItem(
        "bazaar-watchlists",
        JSON.stringify(this.watchlists)
      );
    } catch (error) {
      console.error("Error saving watchlists:", error);
    }
  }

  showCreateWatchlistModal() {
    this.watchlistNameInput.value = "";
    this.createWatchlistModal.classList.remove("hidden");
    this.watchlistNameInput.focus();
  }

  hideCreateWatchlistModal() {
    this.createWatchlistModal.classList.add("hidden");
    this.watchlistNameInput.value = "";
  }

  confirmCreateWatchlist() {
    const watchlistName = this.watchlistNameInput.value.trim();
    if (!watchlistName) {
      alert("Please enter a watchlist name");
      return;
    }

    const watchlistId = `watchlist-${Date.now()}`;
    const newWatchlist = {
      id: watchlistId,
      name: watchlistName,
      stocks: [],
    };

    this.watchlists.push(newWatchlist);
    this.saveWatchlists();
    this.hideCreateWatchlistModal();
    this.renderWatchlists();
    this.switchWatchlist(watchlistId);
  }

  async searchStocksForWatchlist(watchlistId, query) {
    try {
      const results = await window.api.searchStocks(query);
      this.showWatchlistSearchResults(watchlistId, results);
    } catch (error) {
      console.error("Error searching stocks:", error);
      this.hideWatchlistSearchResults(watchlistId);
    }
  }

  showWatchlistSearchResults(watchlistId, results) {
    const searchResults = this.watchlistContent.querySelector(
      `.watchlist-search-results[data-watchlist-id="${watchlistId}"]`
    );
    if (!searchResults) return;

    searchResults.innerHTML = "";

    if (results && results.length > 0) {
      results.forEach((stock) => {
        const item = document.createElement("div");
        item.className = "watchlist-search-result-item";
        item.dataset.symbol = stock.symbol;

        const symbolDiv = document.createElement("div");
        symbolDiv.className = "search-result-symbol";
        symbolDiv.textContent = stock.symbol;

        const nameDiv = document.createElement("div");
        nameDiv.className = "search-result-name";
        nameDiv.textContent = stock.companyName;

        const priceDiv = document.createElement("div");
        priceDiv.className = "search-result-price";
        priceDiv.textContent = `₹${NumberFormatter.formatIndian(
          stock.lastPrice
        )}`;

        const changeDiv = document.createElement("div");
        const isPositive = stock.pChange >= 0;
        changeDiv.className = `search-result-change ${
          isPositive ? "positive" : "negative"
        }`;
        const arrow = isPositive ? "▲" : "▼";
        changeDiv.textContent = `${arrow} ${Math.abs(stock.pChange).toFixed(
          2
        )}%`;

        item.appendChild(symbolDiv);
        item.appendChild(nameDiv);
        item.appendChild(priceDiv);
        item.appendChild(changeDiv);

        searchResults.appendChild(item);
      });
      searchResults.classList.remove("hidden");
    } else {
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "empty-message";
      emptyDiv.style.padding = "10px";
      emptyDiv.style.textAlign = "center";
      emptyDiv.textContent = "No results found";
      searchResults.appendChild(emptyDiv);
      searchResults.classList.remove("hidden");
    }
  }

  hideWatchlistSearchResults(watchlistId) {
    const searchResults = this.watchlistContent.querySelector(
      `.watchlist-search-results[data-watchlist-id="${watchlistId}"]`
    );
    if (searchResults) {
      searchResults.classList.add("hidden");
      searchResults.innerHTML = "";
    }
  }

  deleteWatchlist(watchlistId) {
    if (!confirm("Are you sure you want to delete this watchlist?")) {
      return;
    }

    this.watchlists = this.watchlists.filter((w) => w.id !== watchlistId);
    this.saveWatchlists();

    if (this.activeWatchlistId === watchlistId) {
      this.activeWatchlistId = null;
    }

    this.renderWatchlists();
  }

  renameWatchlist(watchlistId) {
    const watchlist = this.watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) return;

    const newName = prompt("Enter new watchlist name:", watchlist.name);
    if (!newName || !newName.trim()) {
      return;
    }

    watchlist.name = newName.trim();
    this.saveWatchlists();
    this.renderWatchlists();
    this.switchWatchlist(watchlistId);
  }

  switchWatchlist(watchlistId) {
    const watchlist = this.watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) return;

    this.activeWatchlistId = watchlistId;
    this.renderWatchlists();
    this.refreshWatchlistStocks(watchlistId);
  }

  addStockToWatchlist(watchlistId, symbol) {
    if (!symbol) {
      alert("Please enter a stock symbol");
      return;
    }

    const watchlist = this.watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) return;

    // Check if stock already exists
    if (watchlist.stocks.some((s) => s.symbol === symbol.toUpperCase())) {
      alert("Stock already in watchlist");
      return;
    }

    // Add stock with placeholder data
    watchlist.stocks.push({
      symbol: symbol.toUpperCase(),
      price: null,
      change: null,
      change_pct: null,
    });

    this.saveWatchlists();
    this.renderWatchlists();
    this.refreshWatchlistStocks(watchlistId);
  }

  removeStockFromWatchlist(watchlistId, symbol) {
    const watchlist = this.watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) return;

    watchlist.stocks = watchlist.stocks.filter((s) => s.symbol !== symbol);
    this.saveWatchlists();
    this.renderWatchlists();
    this.refreshWatchlistStocks(watchlistId);
  }

  async refreshWatchlistStocks(watchlistId) {
    const watchlist = this.watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) {
      return;
    }

    if (watchlist.stocks.length === 0) {
      this.updateWatchlistContent(watchlistId);
      return;
    }

    try {
      // Fetch stock data for all symbols in the watchlist
      const stockPromises = watchlist.stocks.map(async (stock) => {
        try {
          const quote = await window.api.getStockQuote(stock.symbol, "1D");
          if (quote) {
            return {
              symbol: stock.symbol,
              price: quote.price,
              change: quote.change || 0,
              change_pct: quote.change_pct,
            };
          }
          return stock; // Return original if fetch fails
        } catch (error) {
          console.error(`Error fetching data for ${stock.symbol}:`, error);
          return stock; // Return original if fetch fails
        }
      });

      const updatedStocks = await Promise.all(stockPromises);
      watchlist.stocks = updatedStocks;
      this.saveWatchlists();

      // Update content only if this is the active watchlist
      if (this.activeWatchlistId === watchlistId) {
        this.updateWatchlistContent(watchlistId);
      }
    } catch (error) {
      console.error("Error refreshing watchlist stocks:", error);
    }
  }

  renderWatchlists() {
    // Render tabs
    this.watchlistTabs.innerHTML = "";

    if (this.watchlists.length === 0) {
      this.watchlistContent.innerHTML =
        '<div class="empty-watchlist-message">No watchlists created yet. Click "Create New Watchlist" to get started!</div>';
      return;
    }

    this.watchlists.forEach((watchlist) => {
      const tab = UIComponents.createWatchlistTab(
        watchlist.id,
        watchlist.name,
        watchlist.id === this.activeWatchlistId
      );
      this.watchlistTabs.appendChild(tab);
    });

    // Render content for active watchlist
    if (this.activeWatchlistId) {
      const watchlist = this.watchlists.find(
        (w) => w.id === this.activeWatchlistId
      );
      if (watchlist) {
        this.updateWatchlistContent(this.activeWatchlistId);
      }
    } else if (this.watchlists.length > 0) {
      // Auto-select first watchlist if none is active
      this.switchWatchlist(this.watchlists[0].id);
    }
  }

  updateWatchlistContent(watchlistId) {
    const watchlist = this.watchlists.find((w) => w.id === watchlistId);
    if (!watchlist) return;

    const content = UIComponents.createWatchlistContent(
      watchlist.id,
      watchlist.name,
      watchlist.stocks
    );

    this.watchlistContent.innerHTML = "";
    this.watchlistContent.appendChild(content);

    // Attach event listeners for stock items
    const stockItems = content.querySelectorAll(".watchlist-stock-item");
    stockItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        if (!e.target.classList.contains("watchlist-stock-remove")) {
          const symbol = item.dataset.symbol;
          this.openStockProfile(symbol);
        }
      });
    });
  }

  startWatchlistAutoRefresh() {
    if (this.watchlistRefreshTimer) {
      clearInterval(this.watchlistRefreshTimer);
    }

    // Refresh active watchlist every 10 seconds
    this.watchlistRefreshTimer = setInterval(() => {
      if (this.activeWatchlistId) {
        this.refreshWatchlistStocks(this.activeWatchlistId);
      }
    }, this.watchlistRefreshInterval);
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new BazaarApp();
});
