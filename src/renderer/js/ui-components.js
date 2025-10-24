// UI Component builders

const UIComponents = {
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
    price.textContent = data.price.toFixed(2);
    price.dataset.value = data.price;

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
      priceElement.textContent = newPrice.toFixed(2);
      priceElement.dataset.value = newPrice;
    }

    // Update change
    const isPositive = data.change >= 0;
    changeElement.className = `ticker-change ${
      isPositive ? "positive" : "negative"
    }`;
    const arrow = isPositive ? "▲" : "▼";
    changeElement.textContent = `${arrow} ${Math.abs(data.change).toFixed(
      2
    )} (${Math.abs(data.change_pct).toFixed(2)}%)`;

    // Update info
    infoElement.textContent = `Open: ${data.open.toFixed(
      2
    )} | High: ${data.high.toFixed(2)} | Low: ${data.low.toFixed(2)}`;
  },

  /**
   * Create a stock list item
   */
  createStockItem(stock) {
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
