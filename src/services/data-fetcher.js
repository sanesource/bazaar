const { NseIndia } = require("stock-nse-india");
const nseIndia = new NseIndia();

// Yahoo Finance for international data and historical quotes
const YahooFinance = require("yahoo-finance2").default;
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey", "ripHistorical"],
});

// Indian market index symbols (for NSE index data)
const INDICES = {
  NIFTY50: "NIFTY 50",
  BANKNIFTY: "NIFTY BANK",
  MIDCAP100: "NIFTY MIDCAP 100",
  SMALLCAP250: "NIFTY SMLCAP 250",
  VIX: "INDIA VIX",
};

// Sectoral indices
const SECTORS = {
  IT: "NIFTY IT",
  Bank: "NIFTY BANK",
  Auto: "NIFTY AUTO",
  Pharma: "NIFTY PHARMA",
  Metal: "NIFTY METAL",
  FMCG: "NIFTY FMCG",
  Realty: "NIFTY REALTY",
  Energy: "NIFTY ENERGY",
  Infra: "NIFTY INFRASTRUCTURE",
  Media: "NIFTY MEDIA",
};

// Cache for stock lists (dynamically fetched) - used by old getStockList function
const stockListsCache = {
  NIFTY50: null,
  BANKNIFTY: null,
  MIDCAP100: null,
  SMALLCAP250: null,
  lastFetched: null,
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Cache for dynamically fetched index constituents
const indexConstituentsCache = {
  NIFTY50: null,
  BANKNIFTY: null,
  MIDCAP100: null,
  SMALLCAP250: null,
  lastFetched: null,
};

/**
 * Fetch actual index constituents from NSE API
 * Uses official NSE index constituent data
 */
async function getIndexConstituents(index) {
  try {
    const now = Date.now();

    // Check cache - valid for 24 hours
    if (
      indexConstituentsCache[index] &&
      indexConstituentsCache.lastFetched &&
      now - indexConstituentsCache.lastFetched < CACHE_DURATION
    ) {
      console.log(`Using cached constituents for ${index}`);
      return indexConstituentsCache[index];
    }

    // Map our index names to NSE API index names
    const indexMapping = {
      NIFTY50: "NIFTY%2050",
      BANKNIFTY: "NIFTY%20BANK",
      MIDCAP100: "NIFTY%20MIDCAP%20100",
      SMALLCAP250: "NIFTY%20SMLCAP%20250",
    };

    const nseIndexName = indexMapping[index];
    if (!nseIndexName) {
      throw new Error(`Unknown index: ${index}`);
    }

    // Fetch actual constituents from NSE
    console.log(`Fetching actual constituents for ${index} from NSE...`);
    const result = await nseIndia.getDataByEndpoint(
      `/api/equity-stockIndices?index=${nseIndexName}`
    );

    if (!result || !result.data || !Array.isArray(result.data)) {
      throw new Error(`Invalid response for index: ${index}`);
    }

    // Extract stock symbols (skip first item which is the index itself)
    const constituents = result.data
      .slice(1) // Skip the index itself
      .filter((item) => item.symbol && item.symbol !== index)
      .map((item) => `${item.symbol}.NS`);

    if (constituents.length === 0) {
      throw new Error(`No constituents found for index: ${index}`);
    }

    // Cache the results
    indexConstituentsCache[index] = constituents;
    indexConstituentsCache.lastFetched = now;

    console.log(
      `✓ Loaded ${constituents.length} ACTUAL constituents for ${index} from NSE`
    );
    return constituents;
  } catch (error) {
    console.error(`Error fetching constituents for ${index}:`, error.message);
    throw error;
  }
}

/**
 * Get dynamic stock list for an index using pre-open market data
 */
async function getStockList(index) {
  try {
    const now = Date.now();

    // Check cache
    if (
      stockListsCache[index] &&
      stockListsCache.lastFetched &&
      now - stockListsCache.lastFetched < CACHE_DURATION
    ) {
      return stockListsCache[index];
    }

    // Get pre-open market data which includes all actively traded stocks
    const preOpenData = await nseIndia.getPreOpenMarketData();

    if (!preOpenData || !preOpenData.data || !Array.isArray(preOpenData.data)) {
      throw new Error("Invalid pre-open market data");
    }

    let stocks = [];

    if (index === "NIFTY50") {
      // Get top 50 stocks by liquidity (total turnover)
      stocks = preOpenData.data
        .filter(
          (item) =>
            item.metadata && item.metadata.totalTurnover && item.metadata.symbol
        )
        .sort(
          (a, b) =>
            parseFloat(b.metadata.totalTurnover) -
            parseFloat(a.metadata.totalTurnover)
        )
        .slice(0, 50)
        .map((item) => item.metadata.symbol);
    } else if (index === "BANKNIFTY") {
      // Get banking and financial sector stocks by liquidity
      // Filter stocks with BANK, FINSERV, or known financial keywords in identifier
      const bankingKeywords = [
        "BANK",
        "FINSERV",
        "FINANCE",
        "CAPITAL",
        "SECURITIES",
      ];

      stocks = preOpenData.data
        .filter((item) => {
          if (
            !item.metadata ||
            !item.metadata.symbol ||
            !item.metadata.identifier
          ) {
            return false;
          }
          const identifier = item.metadata.identifier.toUpperCase();
          const symbol = item.metadata.symbol.toUpperCase();
          return bankingKeywords.some(
            (keyword) =>
              identifier.includes(keyword) || symbol.includes(keyword)
          );
        })
        .filter((item) => item.metadata.totalTurnover)
        .sort(
          (a, b) =>
            parseFloat(b.metadata.totalTurnover) -
            parseFloat(a.metadata.totalTurnover)
        )
        .slice(0, 20)
        .map((item) => item.metadata.symbol);
    } else if (index === "NIFTY500") {
      // Get top 500 stocks by liquidity
      stocks = preOpenData.data
        .filter(
          (item) =>
            item.metadata && item.metadata.totalTurnover && item.metadata.symbol
        )
        .sort(
          (a, b) =>
            parseFloat(b.metadata.totalTurnover) -
            parseFloat(a.metadata.totalTurnover)
        )
        .slice(0, 500)
        .map((item) => item.metadata.symbol);
    }

    if (stocks.length === 0) {
      throw new Error(`No stocks found for index: ${index}`);
    }

    // Cache the results
    stockListsCache[index] = stocks;
    stockListsCache.lastFetched = now;

    console.log(`Dynamically loaded ${stocks.length} stocks for ${index}`);
    return stocks;
  } catch (error) {
    console.error(`Error fetching stock list for ${index}:`, error.message);
    throw error; // Re-throw to let caller handle it
  }
}

/**
 * Get data for a specific index
 */
async function getIndexData(indexName) {
  try {
    const indexSymbol = INDICES[indexName];
    if (!indexSymbol) {
      throw new Error(`Unknown index: ${indexName}`);
    }

    const data = await nseIndia.getAllIndices();

    if (!data || !data.data) {
      return null;
    }

    // Find the specific index in the returned data
    const quote = data.data.find((item) => item.indexSymbol === indexSymbol);

    if (!quote) {
      console.error(`Index ${indexSymbol} not found in API response`);
      return null;
    }

    const currentPrice = parseFloat(quote.last) || 0;
    const prevClose = parseFloat(quote.previousClose) || currentPrice;
    const change = currentPrice - prevClose;
    const changePct = (change / prevClose) * 100;

    return {
      name: indexName,
      price: currentPrice,
      change: change,
      change_pct: changePct,
      high: parseFloat(quote.high) || 0,
      low: parseFloat(quote.low) || 0,
      open: parseFloat(quote.open) || 0,
      volume: parseFloat(quote.totalTradedVolume) || 0,
    };
  } catch (error) {
    console.error(`Error fetching ${indexName}:`, error.message);
    return null;
  }
}

/**
 * Get market summary for all major indices
 */
async function getMarketData() {
  try {
    const indices = ["NIFTY50", "BANKNIFTY", "MIDCAP100", "SMALLCAP250"];
    const summary = {};

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
 * Get stock quote with historical data
 */
async function getStockQuote(symbol, timePeriod = "1D") {
  try {
    // Get current quote
    const quote = await nseIndia.getEquityDetails(symbol);

    if (!quote || !quote.priceInfo) {
      return null;
    }

    const priceInfo = quote.priceInfo;
    const currentPrice = parseFloat(priceInfo.lastPrice) || 0;
    const prevClose = parseFloat(priceInfo.previousClose) || currentPrice;

    let changePct;

    // Calculate change based on time period
    if (timePeriod === "1D") {
      changePct = ((currentPrice - prevClose) / prevClose) * 100;
    } else {
      // For longer periods, try to get historical data
      try {
        const endDate = new Date();
        const startDate = new Date();

        // Calculate start date based on time period
        switch (timePeriod) {
          case "1Week":
            startDate.setDate(startDate.getDate() - 7);
            break;
          case "1Month":
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case "6Months":
            startDate.setMonth(startDate.getMonth() - 6);
            break;
          case "1Year":
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          default:
            startDate.setDate(startDate.getDate() - 1);
        }

        const historicalData = await nseIndia.getEquityHistoricalData(symbol, {
          start: startDate,
          end: endDate,
        });

        if (historicalData && historicalData.length >= 2) {
          const oldestPrice = parseFloat(historicalData[0].CH_CLOSING_PRICE);
          if (oldestPrice > 0) {
            changePct = ((currentPrice - oldestPrice) / oldestPrice) * 100;
          } else {
            changePct = parseFloat(priceInfo.pChange) || 0;
          }
        } else {
          // Fallback to daily change
          changePct = parseFloat(priceInfo.pChange) || 0;
        }
      } catch (histError) {
        // Fallback to daily change if historical data fails
        changePct = parseFloat(priceInfo.pChange) || 0;
      }
    }

    return {
      symbol: symbol,
      price: currentPrice,
      change_pct: changePct,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get top gainers and losers - OPTIMIZED for speed
 */
async function getGainersLosers({
  index = "NIFTY50",
  timePeriod = "1D",
  limit = 10,
}) {
  try {
    if (timePeriod === "1D") {
      // FAST PATH: Use pre-open market data (already has ALL stocks)
      console.log(`Fetching gainers/losers for ${index} (1D) - FAST MODE`);

      const preOpenData = await nseIndia.getPreOpenMarketData();

      if (
        !preOpenData ||
        !preOpenData.data ||
        !Array.isArray(preOpenData.data)
      ) {
        throw new Error("Invalid pre-open market data");
      }

      // Get our index constituents for filtering
      const constituents = await getIndexConstituents(index);
      const constituentSet = new Set(
        constituents.map((s) => s.replace(".NS", ""))
      );

      // Filter pre-open data by our index constituents
      const indexStocks = preOpenData.data
        .filter(
          (item) =>
            item.metadata &&
            item.metadata.symbol &&
            constituentSet.has(item.metadata.symbol)
        )
        .map((item) => ({
          symbol: item.metadata.symbol,
          price: parseFloat(item.metadata.lastPrice) || 0,
          change_pct: parseFloat(item.metadata.pChange) || 0,
        }))
        .filter((stock) => stock.price > 0);

      // Sort by change percentage
      indexStocks.sort((a, b) => b.change_pct - a.change_pct);

      console.log(
        `✓ Instantly got ${indexStocks.length} stocks from pre-open data`
      );

      return {
        gainers: indexStocks.slice(0, limit),
        losers: indexStocks.slice(-limit).reverse(),
      };
    } else {
      // HISTORICAL DATA: Fetch all index constituents
      console.log(
        `Fetching gainers/losers for ${index} (${timePeriod}) - Using all constituents`
      );

      // Get all constituents
      const symbols = await getIndexConstituents(index);
      console.log(
        `Fetching historical data for all ${symbols.length} stocks in ${index}`
      );

      const endDate = new Date();
      const startDate = new Date();

      // Calculate start date based on time period
      switch (timePeriod) {
        case "1Week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "1Month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "6Months":
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case "1Year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 1);
      }

      const stockData = [];

      // Fetch in batches of 5 for better speed
      const batchSize = 50;
      for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (symbol) => {
            try {
              const historical = await yahooFinance.chart(symbol, {
                period1: startDate,
                period2: endDate,
                interval: "1d",
              });

              if (
                !historical ||
                !historical.quotes ||
                historical.quotes.length < 2
              ) {
                return null;
              }

              const quotes = historical.quotes;
              const oldPrice = quotes[0].close;
              const newPrice = quotes[quotes.length - 1].close;

              if (!oldPrice || !newPrice) return null;

              const changePct = ((newPrice - oldPrice) / oldPrice) * 100;

              return {
                symbol: symbol.replace(".NS", ""),
                price: newPrice,
                change_pct: changePct,
              };
            } catch (error) {
              return null;
            }
          })
        );

        stockData.push(...batchResults.filter(Boolean));

        // Progress logging
        console.log(
          `  Processed ${Math.min(i + batchSize, symbols.length)}/${
            symbols.length
          } stocks`
        );

        // Small delay between batches
        if (i + batchSize < symbols.length) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      if (stockData.length === 0) {
        console.error("No historical data retrieved");
        return { gainers: [], losers: [] };
      }

      console.log(`✓ Successfully fetched ${stockData.length} stocks`);

      // Sort by change percentage
      stockData.sort((a, b) => b.change_pct - a.change_pct);

      return {
        gainers: stockData.slice(0, limit),
        losers: stockData.slice(-limit).reverse(),
      };
    }
  } catch (error) {
    console.error("Error fetching gainers/losers:", error);
    return { gainers: [], losers: [] };
  }
}

/**
 * Get VIX data
 */
async function getVixData() {
  return await getIndexData("VIX");
}

/**
 * Get sectoral performance data
 */
async function getSectoralPerformance() {
  try {
    // Fetch all indices data once
    const data = await nseIndia.getAllIndices();

    if (!data || !data.data) {
      return [];
    }

    const sectoralData = [];

    for (const [sectorName, indexSymbol] of Object.entries(SECTORS)) {
      try {
        // Find the sector index in the data
        const quote = data.data.find(
          (item) => item.indexSymbol === indexSymbol
        );

        if (quote) {
          const currentPrice = parseFloat(quote.last) || 0;
          const prevClose = parseFloat(quote.previousClose) || currentPrice;
          const changePct = ((currentPrice - prevClose) / prevClose) * 100;

          sectoralData.push({
            sector: sectorName,
            price: currentPrice,
            change_pct: changePct,
          });
        }
      } catch (error) {
        console.error(`Error processing ${sectorName}:`, error.message);
      }
    }

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
  getSectoralPerformance,
  getStockList, // Export for testing
};
