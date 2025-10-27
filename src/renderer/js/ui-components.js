// UI Component builders

// Number formatting utilities
const NumberFormatter = {
  /**
   * Format number with Indian numbering system (lakhs, crores)
   * Example: 12345.67 -> 12,345.67
   */
  formatIndian(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return "0.00";

    const numStr = num.toFixed(decimals);
    const [intPart, decPart] = numStr.split(".");

    // Indian numbering: last 3 digits, then groups of 2
    let formattedInt = intPart;
    if (intPart.length > 3) {
      const lastThree = intPart.slice(-3);
      const remaining = intPart.slice(0, -3);
      formattedInt =
        remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
    }

    return decPart ? `${formattedInt}.${decPart}` : formattedInt;
  },

  /**
   * Format large numbers in compact form (K, L, Cr)
   */
  formatCompact(num) {
    if (num === null || num === undefined || isNaN(num)) return "0";

    const absNum = Math.abs(num);
    const sign = num < 0 ? "-" : "";

    if (absNum >= 10000000) {
      // Crores
      return `${sign}${(absNum / 10000000).toFixed(2)} Cr`;
    } else if (absNum >= 100000) {
      // Lakhs
      return `${sign}${(absNum / 100000).toFixed(2)} L`;
    } else if (absNum >= 1000) {
      // Thousands
      return `${sign}${(absNum / 1000).toFixed(2)} K`;
    }
    return `${sign}${absNum.toFixed(2)}`;
  },
};

const UIComponents = {
  /**
   * Create a search result item
   */
  createSearchResultItem(stock) {
    const item = document.createElement("div");
    item.className = "search-result-item";
    item.dataset.symbol = stock.symbol;

    const symbolDiv = document.createElement("div");
    symbolDiv.className = "search-result-symbol";
    symbolDiv.textContent = stock.symbol;

    const nameDiv = document.createElement("div");
    nameDiv.className = "search-result-name";
    nameDiv.textContent = stock.companyName;

    const priceDiv = document.createElement("div");
    priceDiv.className = "search-result-price";
    priceDiv.textContent = `₹${NumberFormatter.formatIndian(stock.lastPrice)}`;

    const changeDiv = document.createElement("div");
    const isPositive = stock.pChange >= 0;
    changeDiv.className = `search-result-change ${
      isPositive ? "positive" : "negative"
    }`;
    const arrow = isPositive ? "▲" : "▼";
    changeDiv.textContent = `${arrow} ${Math.abs(stock.pChange).toFixed(2)}%`;

    item.appendChild(symbolDiv);
    item.appendChild(nameDiv);
    item.appendChild(priceDiv);
    item.appendChild(changeDiv);

    return item;
  },

  /**
   * Create a trending stock mini tag
   */
  createTrendingStockItem(stock) {
    const item = document.createElement("div");
    item.className = "trending-stock-tag";
    item.dataset.symbol = stock.symbol;

    const symbolDiv = document.createElement("span");
    symbolDiv.className = "trending-tag-symbol";
    symbolDiv.textContent = stock.symbol;

    const priceDiv = document.createElement("span");
    priceDiv.className = "trending-tag-price";
    priceDiv.textContent = `₹${NumberFormatter.formatIndian(stock.lastPrice)}`;

    const changeDiv = document.createElement("span");
    const isPositive = stock.pChange >= 0;
    changeDiv.className = `trending-tag-change ${
      isPositive ? "positive" : "negative"
    }`;
    const arrow = isPositive ? "▲" : "▼";
    changeDiv.textContent = `${arrow}${Math.abs(stock.pChange).toFixed(1)}%`;

    item.appendChild(symbolDiv);
    item.appendChild(priceDiv);
    item.appendChild(changeDiv);

    return item;
  },

  /**
   * Create stock profile modal content
   */
  createStockProfile(profile) {
    const container = document.createElement("div");
    container.className = "stock-profile-container";

    // Header Section
    const header = document.createElement("div");
    header.className = "stock-profile-header";

    const titleSection = document.createElement("div");
    titleSection.className = "stock-profile-title-section";

    const symbol = document.createElement("h2");
    symbol.className = "stock-profile-symbol";
    symbol.textContent = profile.symbol;

    const companyName = document.createElement("div");
    companyName.className = "stock-profile-company";
    companyName.textContent = profile.companyName;

    const industryInfo = document.createElement("div");
    industryInfo.className = "stock-profile-industry";
    industryInfo.textContent = `${profile.industry} • ${profile.sector}`;

    titleSection.appendChild(symbol);
    titleSection.appendChild(companyName);
    titleSection.appendChild(industryInfo);

    const priceSection = document.createElement("div");
    priceSection.className = "stock-profile-price-section";

    const currentPrice = document.createElement("div");
    currentPrice.className = "stock-profile-current-price";
    currentPrice.textContent = `₹${NumberFormatter.formatIndian(
      profile.currentPrice
    )}`;

    const change = document.createElement("div");
    const isPositive = profile.changePct >= 0;
    change.className = `stock-profile-change ${
      isPositive ? "positive" : "negative"
    }`;
    const arrow = isPositive ? "▲" : "▼";
    change.textContent = `${arrow} ₹${NumberFormatter.formatIndian(
      Math.abs(profile.change)
    )} (${Math.abs(profile.changePct).toFixed(2)}%)`;

    priceSection.appendChild(currentPrice);
    priceSection.appendChild(change);

    header.appendChild(titleSection);
    header.appendChild(priceSection);

    // Info Grid Section
    const infoGrid = document.createElement("div");
    infoGrid.className = "stock-profile-info-grid";

    const infoItems = [
      {
        label: "Previous Close",
        value: `₹${NumberFormatter.formatIndian(profile.previousClose)}`,
      },
      {
        label: "Open",
        value: `₹${NumberFormatter.formatIndian(profile.open)}`,
      },
      {
        label: "Day High",
        value: `₹${NumberFormatter.formatIndian(profile.high)}`,
      },
      {
        label: "Day Low",
        value: `₹${NumberFormatter.formatIndian(profile.low)}`,
      },
      {
        label: "52W High",
        value: `₹${NumberFormatter.formatIndian(profile.week52High)}`,
      },
      {
        label: "52W Low",
        value: `₹${NumberFormatter.formatIndian(profile.week52Low)}`,
      },
      { label: "Volume", value: NumberFormatter.formatCompact(profile.volume) },
      {
        label: "Total Traded Value",
        value: `₹${NumberFormatter.formatCompact(profile.totalTradedValue)}`,
      },
      { label: "ISIN", value: profile.isin },
      { label: "Last Updated", value: profile.lastUpdateTime },
    ];

    infoItems.forEach((item) => {
      const infoItem = document.createElement("div");
      infoItem.className = "stock-profile-info-item";

      const label = document.createElement("div");
      label.className = "stock-profile-info-label";
      label.textContent = item.label;

      const value = document.createElement("div");
      value.className = "stock-profile-info-value";
      value.textContent = item.value;

      infoItem.appendChild(label);
      infoItem.appendChild(value);

      infoGrid.appendChild(infoItem);
    });

    container.appendChild(header);
    container.appendChild(infoGrid);

    return container;
  },

  /**
   * Create a ticker card element
   */
  createTickerCard(data) {
    const card = document.createElement("div");
    card.className = "ticker-card";
    card.dataset.indexName = data.name;

    const name = document.createElement("div");
    name.className = "ticker-name";
    name.textContent = data.name;

    const price = document.createElement("div");
    price.className = "ticker-price";
    price.textContent = NumberFormatter.formatIndian(data.price);
    price.dataset.value = data.price;

    const change = document.createElement("div");
    const isPositive = data.change >= 0;
    change.className = `ticker-change ${isPositive ? "positive" : "negative"}`;
    const arrow = isPositive ? "▲" : "▼";
    change.textContent = `${arrow} ${NumberFormatter.formatIndian(
      Math.abs(data.change)
    )} (${Math.abs(data.change_pct).toFixed(2)}%)`;

    const info = document.createElement("div");
    info.className = "ticker-info";
    info.textContent = `Open: ${NumberFormatter.formatIndian(
      data.open
    )} | High: ${NumberFormatter.formatIndian(
      data.high
    )} | Low: ${NumberFormatter.formatIndian(data.low)}`;

    card.appendChild(name);
    card.appendChild(price);
    card.appendChild(change);
    card.appendChild(info);

    return card;
  },

  /**
   * Update ticker card with animation
   */
  updateTickerCard(card, data) {
    const priceElement = card.querySelector(".ticker-price");
    const changeElement = card.querySelector(".ticker-change");
    const infoElement = card.querySelector(".ticker-info");

    const oldPrice = parseFloat(priceElement.dataset.value);
    const newPrice = data.price;

    // Update price with animation if changed
    if (oldPrice !== newPrice) {
      // Remove old animation classes
      priceElement.classList.remove("price-up", "price-down");
      card.classList.remove("updating");

      // Trigger reflow to restart animation
      void priceElement.offsetWidth;

      // Add animation class based on direction
      if (newPrice > oldPrice) {
        priceElement.classList.add("price-up");
      } else if (newPrice < oldPrice) {
        priceElement.classList.add("price-down");
      }

      card.classList.add("updating");

      // Update the displayed value
      priceElement.textContent = NumberFormatter.formatIndian(newPrice);
      priceElement.dataset.value = newPrice;
    }

    // Update change
    const isPositive = data.change >= 0;
    changeElement.className = `ticker-change ${
      isPositive ? "positive" : "negative"
    }`;
    const arrow = isPositive ? "▲" : "▼";
    changeElement.textContent = `${arrow} ${NumberFormatter.formatIndian(
      Math.abs(data.change)
    )} (${Math.abs(data.change_pct).toFixed(2)}%)`;

    // Update info
    infoElement.textContent = `Open: ${NumberFormatter.formatIndian(
      data.open
    )} | High: ${NumberFormatter.formatIndian(
      data.high
    )} | Low: ${NumberFormatter.formatIndian(data.low)}`;
  },

  /**
   * Create a stock list item
   */
  createStockItem(stock) {
    const item = document.createElement("div");
    item.className = "stock-item";
    item.dataset.symbol = stock.symbol;

    const symbol = document.createElement("div");
    symbol.className = "stock-symbol";
    symbol.textContent = stock.symbol;

    const price = document.createElement("div");
    price.className = "stock-price";
    price.textContent = `₹${NumberFormatter.formatIndian(stock.price)}`;
    price.dataset.value = stock.price;

    const change = document.createElement("div");
    const changePct = stock.change_pct;
    const isPositive = changePct >= 0;
    change.className = `stock-change ${isPositive ? "positive" : "negative"}`;
    const arrow = isPositive ? "▲" : "▼";
    change.textContent = `${arrow} ${Math.abs(changePct).toFixed(2)}%`;
    change.dataset.value = changePct;

    item.appendChild(symbol);
    item.appendChild(price);
    item.appendChild(change);

    return item;
  },

  /**
   * Update stock list item with animation
   */
  updateStockItem(item, stock) {
    const priceElement = item.querySelector(".stock-price");
    const changeElement = item.querySelector(".stock-change");

    const oldPrice = parseFloat(priceElement.dataset.value);
    const newPrice = stock.price;
    const oldChangePct = parseFloat(changeElement.dataset.value);
    const newChangePct = stock.change_pct;

    // Update price with animation if changed
    if (oldPrice !== newPrice) {
      priceElement.classList.remove("value-flash-up", "value-flash-down");
      void priceElement.offsetWidth; // Trigger reflow

      if (newPrice > oldPrice) {
        priceElement.classList.add("value-flash-up");
      } else if (newPrice < oldPrice) {
        priceElement.classList.add("value-flash-down");
      }

      priceElement.textContent = `₹${NumberFormatter.formatIndian(newPrice)}`;
      priceElement.dataset.value = newPrice;
    }

    // Update change with animation
    if (oldChangePct !== newChangePct) {
      changeElement.classList.remove("value-flash-up", "value-flash-down");
      void changeElement.offsetWidth; // Trigger reflow

      if (newChangePct > oldChangePct) {
        changeElement.classList.add("value-flash-up");
      } else if (newChangePct < oldChangePct) {
        changeElement.classList.add("value-flash-down");
      }
    }

    const isPositive = newChangePct >= 0;
    changeElement.className = `stock-change ${
      isPositive ? "positive" : "negative"
    }`;
    const arrow = isPositive ? "▲" : "▼";
    changeElement.textContent = `${arrow} ${Math.abs(newChangePct).toFixed(
      2
    )}%`;
    changeElement.dataset.value = newChangePct;
  },

  /**
   * Create a sector performance row
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
