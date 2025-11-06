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
      // FAST PATH: Use LIVE market data from NSE index endpoint
      console.log(`Fetching gainers/losers for ${index} (1D) - LIVE DATA`);

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

      // Fetch LIVE data from NSE index endpoint
      const result = await nseIndia.getDataByEndpoint(
        `/api/equity-stockIndices?index=${nseIndexName}`
      );

      if (!result || !result.data || !Array.isArray(result.data)) {
        throw new Error(`Invalid response for index: ${index}`);
      }

      // Extract stock data with LIVE prices (skip first item which is the index itself)
      const indexStocks = result.data
        .slice(1) // Skip the index itself
        .filter((item) => item.symbol && item.symbol !== index)
        .map((item) => ({
          symbol: item.symbol,
          price: parseFloat(item.lastPrice) || 0,
          change_pct: parseFloat(item.pChange) || 0,
        }))
        .filter((stock) => stock.price > 0);

      // Sort by change percentage
      indexStocks.sort((a, b) => b.change_pct - a.change_pct);

      console.log(`✓ Got ${indexStocks.length} stocks with LIVE market data`);

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
 * Get sectoral performance data with time period support
 */
async function getSectoralPerformance(timePeriod = "1D") {
  try {
    if (timePeriod === "1D") {
      // FAST PATH: Use LIVE market data from NSE indices endpoint
      console.log(`Fetching sectoral data for ${timePeriod} - LIVE DATA`);

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
    } else {
      // HISTORICAL DATA: Use Yahoo Finance for different time periods
      console.log(`Fetching sectoral data for ${timePeriod} - HISTORICAL DATA`);

      const sectoralData = [];

      // Calculate date range based on time period
      const now = new Date();
      let startDate, endDate;

      switch (timePeriod) {
        case "1Week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case "1Month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case "6Months":
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case "1Year":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
      }

      // Map NSE sector symbols to Yahoo Finance symbols
      const sectorSymbols = {
        IT: "^CNXIT",
        Bank: "^NSEBANK",
        Auto: "^CNXAUTO",
        Pharma: "^CNXPHARMA",
        Metal: "^CNXMETAL",
        FMCG: "^CNXFMCG",
        Realty: "^CNXREALTY",
        Energy: "^CNXENERGY",
        Infra: "^CNXINFRA",
        Media: "^CNXMEDIA",
      };

      console.log(`[DataFetcher] Using sector symbols:`, sectorSymbols);

      for (const [sectorName, yahooSymbol] of Object.entries(sectorSymbols)) {
        try {
          const historical = await yahooFinance.chart(yahooSymbol, {
            period1: startDate,
            period2: endDate,
            interval: "1d",
          });

          if (
            historical &&
            historical.quotes &&
            historical.quotes.length >= 2
          ) {
            const quotes = historical.quotes;
            const oldPrice = quotes[0].close;
            const newPrice = quotes[quotes.length - 1].close;

            if (oldPrice && newPrice) {
              const changePct = ((newPrice - oldPrice) / oldPrice) * 100;

              sectoralData.push({
                sector: sectorName,
                price: newPrice,
                change_pct: changePct,
              });
            }
          }
        } catch (error) {
          console.error(
            `Error fetching ${sectorName} historical data:`,
            error.message
          );
        }
      }

      sectoralData.sort((a, b) => b.change_pct - a.change_pct);
      return sectoralData;
    }
  } catch (error) {
    console.error("Error fetching sectoral data:", error);
    return [];
  }
}

/**
 * Search for stocks by symbol or name
 */
async function searchStocks(query) {
  try {
    if (!query || query.trim().length < 1) {
      return [];
    }

    query = query.trim().toUpperCase();

    // Get all stocks from pre-open market data
    const preOpenData = await nseIndia.getPreOpenMarketData();

    if (!preOpenData || !preOpenData.data || !Array.isArray(preOpenData.data)) {
      return [];
    }

    // Search in symbols and company names
    const results = preOpenData.data
      .filter((item) => {
        if (!item.metadata || !item.metadata.symbol) return false;

        const symbol = item.metadata.symbol.toUpperCase();
        const companyName = (
          item.metadata.companyName ||
          item.metadata.identifier ||
          ""
        ).toUpperCase();

        return symbol.includes(query) || companyName.includes(query);
      })
      .slice(0, 10) // Limit to 10 results
      .map((item) => ({
        symbol: item.metadata.symbol,
        companyName:
          item.metadata.companyName ||
          item.metadata.identifier ||
          item.metadata.symbol,
        lastPrice: parseFloat(item.metadata.lastPrice) || 0,
        change: parseFloat(item.metadata.change) || 0,
        pChange: parseFloat(item.metadata.pChange) || 0,
      }));

    return results;
  } catch (error) {
    console.error("Error searching stocks:", error);
    return [];
  }
}

/**
 * Get trending stocks (most active by volume)
 */
async function getTrendingStocks(limit = 5) {
  try {
    const preOpenData = await nseIndia.getPreOpenMarketData();

    if (!preOpenData || !preOpenData.data || !Array.isArray(preOpenData.data)) {
      return [];
    }

    // Get most active stocks by total turnover
    const trendingStocks = preOpenData.data
      .filter(
        (item) =>
          item.metadata &&
          item.metadata.symbol &&
          item.metadata.totalTurnover &&
          item.metadata.lastPrice
      )
      .sort(
        (a, b) =>
          parseFloat(b.metadata.totalTurnover) -
          parseFloat(a.metadata.totalTurnover)
      )
      .slice(0, limit)
      .map((item) => ({
        symbol: item.metadata.symbol,
        companyName:
          item.metadata.companyName ||
          item.metadata.identifier ||
          item.metadata.symbol,
        lastPrice: parseFloat(item.metadata.lastPrice) || 0,
        change: parseFloat(item.metadata.change) || 0,
        pChange: parseFloat(item.metadata.pChange) || 0,
      }));

    return trendingStocks;
  } catch (error) {
    console.error("Error fetching trending stocks:", error);
    return [];
  }
}

/**
 * Get company description from Yahoo Finance
 */
async function getCompanyDescription(symbol) {
  try {
    // Convert NSE symbol to Yahoo Finance format
    const yahooSymbol = `${symbol}.NS`;

    // Get company profile from Yahoo Finance
    const profile = await yahooFinance.quoteSummary(yahooSymbol, {
      modules: ["assetProfile"],
    });

    if (
      profile &&
      profile.assetProfile &&
      profile.assetProfile.longBusinessSummary
    ) {
      return profile.assetProfile.longBusinessSummary;
    }

    return null;
  } catch (error) {
    console.error(
      `Error fetching company description for ${symbol}:`,
      error.message
    );
    return null;
  }
}

/**
 * Get detailed stock profile
 */
async function getStockProfile(symbol) {
  try {
    // Get equity details from NSE
    const quoteData = await nseIndia.getEquityDetails(symbol);

    if (!quoteData) {
      throw new Error(`Stock data not found for ${symbol}`);
    }

    const priceInfo = quoteData.priceInfo || {};
    const info = quoteData.info || {};
    const metadata = quoteData.metadata || {};
    const securityInfo = quoteData.securityInfo || {};

    const currentPrice = parseFloat(priceInfo.lastPrice) || 0;
    const prevClose = parseFloat(priceInfo.previousClose) || currentPrice;
    const change = currentPrice - prevClose;
    const changePct = (change / prevClose) * 100;

    // Get real company description from Yahoo Finance
    const companyDescription = await getCompanyDescription(symbol);

    // Try to get additional financial data from NSE corporate info
    let corporateInfo = {};
    let nseEps = null;
    let calculatedRoe = null;
    let calculatedRoa = null;
    let calculatedDebtToEquity = null;

    try {
      corporateInfo = (await nseIndia.getEquityCorporateInfo(symbol)) || {};

      // Extract EPS from financial results if available
      if (corporateInfo.financial_results?.data?.length > 0) {
        const latestResult = corporateInfo.financial_results.data[0];
        nseEps = parseFloat(latestResult.reDilEPS) || null;
        if (nseEps)
          console.log(`✓ NSE EPS extracted for ${symbol}: ₹${nseEps}`);

        // Try to calculate financial ratios from available data
        const income = parseFloat(latestResult.income) || null;
        const profit = parseFloat(latestResult.proLossAftTax) || null;

        if (profit && income) {
          // Calculate ROA (Return on Assets) = Net Income / Total Assets
          // We'll use a proxy calculation since we don't have exact balance sheet data
          // ROA ≈ Net Profit Margin (as a rough approximation)
          calculatedRoa = (profit / income) * 100;
          console.log(
            `✓ Calculated ROA for ${symbol}: ${calculatedRoa.toFixed(2)}%`
          );
        }
      }
    } catch (e) {
      console.log(`Corporate info not available for ${symbol}`);
    }

    // Try to get financial ratios from Yahoo Finance as backup
    let yahooFinancials = {};
    try {
      const yahooSymbol = `${symbol}.NS`;

      // Try both quoteSummary and quote methods for maximum data coverage
      let yahooData = null;
      let yahooQuote = null;

      try {
        yahooData = await yahooFinance.quoteSummary(yahooSymbol, {
          modules: [
            "defaultKeyStatistics",
            "financialData",
            "summaryDetail",
            "balanceSheetHistory",
          ],
        });
      } catch (e) {
        console.log(`Yahoo quoteSummary failed for ${symbol}:`, e.message);
      }

      try {
        yahooQuote = await yahooFinance.quote(yahooSymbol);
      } catch (e) {
        console.log(`Yahoo quote failed for ${symbol}:`, e.message);
      }

      if (yahooData || yahooQuote) {
        const keyStats = yahooData?.defaultKeyStatistics || {};
        const financialData = yahooData?.financialData || {};
        const summaryDetail = yahooData?.summaryDetail || {};
        const quote = yahooQuote || {};

        yahooFinancials = {
          // PE Ratio - try multiple sources
          peRatio:
            quote.trailingPE ||
            keyStats.trailingPE?.raw ||
            quote.forwardPE ||
            keyStats.forwardPE?.raw ||
            null,

          // PB Ratio - with validation and alternative calculation
          pbRatio: (() => {
            const quotePB = quote.priceToBook;
            const keyStatsPB = keyStats.priceToBook?.raw;

            // Validate P/B ratios - should typically be between 0.1 and 50 for most stocks
            const isValidPB = (pb) => pb && pb > 0.1 && pb < 50;

            if (isValidPB(quotePB)) return quotePB;
            if (isValidPB(keyStatsPB)) return keyStatsPB;

            // For stocks with invalid P/B, try to estimate using ROE and P/E
            // P/B ≈ P/E × ROE (rough approximation)
            const pe = quote.trailingPE || keyStats.trailingPE?.raw;
            const roe =
              financialData.returnOnEquity?.raw || financialData.returnOnEquity;

            if (pe && roe && pe > 0 && roe > 0) {
              const estimatedPB = pe * roe;
              if (isValidPB(estimatedPB)) {
                console.log(
                  `📊 Estimated P/B for ${symbol} using P/E×ROE: ${estimatedPB.toFixed(
                    2
                  )}`
                );
                return estimatedPB;
              }
            }

            // If all methods fail, return null
            return null;
          })(),

          // EPS - try multiple sources
          eps:
            quote.epsTrailingTwelveMonths ||
            keyStats.trailingEps?.raw ||
            financialData.trailingEps?.raw ||
            quote.epsForward ||
            null,

          // Financial Health Ratios
          roe:
            financialData.returnOnEquity?.raw ||
            financialData.returnOnEquity ||
            null,
          roa:
            financialData.returnOnAssets?.raw ||
            financialData.returnOnAssets ||
            null,
          debtToEquity:
            financialData.debtToEquity?.raw ||
            financialData.debtToEquity ||
            null,

          // Other metrics
          beta: keyStats.beta || quote.beta || null,
          dividendYield: quote.dividendYield
            ? quote.dividendYield / 100
            : summaryDetail.dividendYield?.raw || null,
          marketCap: quote.marketCap || summaryDetail.marketCap?.raw || null,
          bookValue: quote.bookValue || keyStats.bookValue?.raw || null,
        };

        // Convert ROE and ROA from decimal to percentage if needed
        if (yahooFinancials.roe && yahooFinancials.roe < 1) {
          yahooFinancials.roe = yahooFinancials.roe * 100;
        }
        if (yahooFinancials.roa && yahooFinancials.roa < 1) {
          yahooFinancials.roa = yahooFinancials.roa * 100;
        }

        // Log data quality issues
        if (quote.priceToBook && quote.priceToBook > 50) {
          console.log(
            `⚠️  Suspicious P/B ratio for ${symbol}: ${quote.priceToBook} (Book Value: ${quote.bookValue}) - Filtering out`
          );
        }

        console.log(`Yahoo Finance data for ${symbol}:`, {
          peRatio: yahooFinancials.peRatio,
          pbRatio: yahooFinancials.pbRatio,
          eps: yahooFinancials.eps,
          roe: yahooFinancials.roe,
          roa: yahooFinancials.roa,
          debtToEquity: yahooFinancials.debtToEquity,
          beta: yahooFinancials.beta,
          pbFiltered: quote.priceToBook > 50 ? "YES" : "NO",
        });
      }
    } catch (e) {
      console.log(`Yahoo Finance data not available for ${symbol}:`, e.message);
    }

    // Calculate market cap if we have shares outstanding
    const sharesOutstanding = parseFloat(securityInfo.issuedSize) || 0;
    const marketCap = sharesOutstanding * currentPrice;

    // Build profile object
    const profile = {
      symbol: symbol,
      companyName: info.companyName || metadata.companyName || symbol,
      industry: info.industry || metadata.industry || "N/A",
      sector: metadata.sector || "N/A",
      isin: metadata.isin || "N/A",
      description: companyDescription || "N/A",

      // Additional company information for enhanced description
      businessDescription:
        info.businessDescription ||
        metadata.businessDescription ||
        info.description ||
        metadata.description ||
        "",
      companyProfile: info.companyProfile || metadata.companyProfile || "",
      businessModel: info.businessModel || metadata.businessModel || "",
      keyProducts: info.keyProducts || metadata.keyProducts || "",
      marketPosition: info.marketPosition || metadata.marketPosition || "",
      foundedYear: info.foundedYear || metadata.foundedYear || "",
      headquarters: info.headquarters || metadata.headquarters || "",
      website: info.website || metadata.website || "",

      // Price Information
      currentPrice: currentPrice,
      change: change,
      changePct: changePct,
      previousClose: prevClose,
      open: parseFloat(priceInfo.open) || 0,
      high: parseFloat(priceInfo.intraDayHighLow?.max) || 0,
      low: parseFloat(priceInfo.intraDayHighLow?.min) || 0,
      volume: parseFloat(priceInfo.totalTradedVolume) || 0,
      totalTradedValue: parseFloat(priceInfo.totalTradedValue) || 0,

      // 52 Week Data
      week52High: parseFloat(priceInfo.weekHighLow?.max) || 0,
      week52Low: parseFloat(priceInfo.weekHighLow?.min) || 0,

      // Market Data & Fundamentals
      marketCap: marketCap > 0 ? marketCap : yahooFinancials.marketCap || null,
      bookValue:
        parseFloat(securityInfo.issuedSize) ||
        yahooFinancials.bookValue ||
        null,
      faceValue: parseFloat(securityInfo.faceValue) || null,

      // Financial ratios - try NSE first, then Yahoo Finance as backup
      peRatio:
        parseFloat(priceInfo.pe) ||
        parseFloat(info.pe) ||
        parseFloat(metadata.pe) ||
        parseFloat(securityInfo.pe) ||
        yahooFinancials.peRatio ||
        null,
      pbRatio:
        parseFloat(priceInfo.pb) ||
        parseFloat(info.pb) ||
        parseFloat(metadata.pb) ||
        parseFloat(securityInfo.pb) ||
        yahooFinancials.pbRatio ||
        null,
      eps:
        parseFloat(priceInfo.eps) ||
        parseFloat(info.eps) ||
        parseFloat(metadata.eps) ||
        parseFloat(securityInfo.eps) ||
        nseEps ||
        yahooFinancials.eps ||
        null,
      dividendYield:
        parseFloat(priceInfo.dividendYield) ||
        parseFloat(info.dividendYield) ||
        yahooFinancials.dividendYield ||
        null,
      beta:
        parseFloat(priceInfo.beta) ||
        parseFloat(info.beta) ||
        parseFloat(metadata.beta) ||
        yahooFinancials.beta ||
        null,
      debtToEquity:
        yahooFinancials.debtToEquity ||
        calculatedDebtToEquity ||
        parseFloat(info.debtToEquity) ||
        null,

      // Financial Health Ratios - prioritize Yahoo Finance data, then calculated values
      roe:
        yahooFinancials.roe ||
        calculatedRoe ||
        parseFloat(corporateInfo.roe) ||
        null,
      roa:
        yahooFinancials.roa ||
        calculatedRoa ||
        parseFloat(corporateInfo.roa) ||
        null,

      // Additional metrics from corporate info if available
      revenue: parseFloat(corporateInfo.revenue) || null,
      netProfit: parseFloat(corporateInfo.netProfit) || null,

      // Other Info
      lastUpdateTime: priceInfo.lastUpdateTime || new Date().toLocaleString(),
    };

    return profile;
  } catch (error) {
    console.error(`Error fetching stock profile for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get historical chart data for a stock
 */
async function getStockChartData(symbol, timePeriod = "1D") {
  try {
    const yahooSymbol = `${symbol}.NS`;
    const endDate = new Date();
    const startDate = new Date();

    // Calculate start date based on time period
    switch (timePeriod) {
      case "1D":
        // For 1 day, get intraday data (1 hour intervals)
        startDate.setDate(startDate.getDate() - 1);
        break;
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
        startDate.setDate(startDate.getDate() - 7);
    }

    // Determine interval based on time period
    let interval = "1d"; // Default to daily
    if (timePeriod === "1D") {
      interval = "1h"; // Hourly for 1 day
    } else if (timePeriod === "1Week") {
      interval = "1d"; // Daily for 1 week
    } else {
      interval = "1d"; // Daily for longer periods
    }

    const historical = await yahooFinance.chart(yahooSymbol, {
      period1: startDate,
      period2: endDate,
      interval: interval,
    });

    if (!historical || !historical.quotes || historical.quotes.length === 0) {
      return { labels: [], prices: [], volumes: [] };
    }

    const quotes = historical.quotes;
    const labels = [];
    const prices = [];
    const volumes = [];

    quotes.forEach((quote) => {
      if (quote.date && quote.close !== null && quote.close !== undefined) {
        const date = new Date(quote.date * 1000);

        // Format labels based on time period
        let label;
        if (timePeriod === "1D") {
          label = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        } else if (timePeriod === "1Week") {
          label = date.toLocaleDateString("en-US", {
            weekday: "short",
            day: "numeric",
          });
        } else {
          label = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }

        labels.push(label);
        prices.push(parseFloat(quote.close) || 0);
        volumes.push(parseFloat(quote.volume) || 0);
      }
    });

    return {
      labels,
      prices,
      volumes,
    };
  } catch (error) {
    console.error(`Error fetching chart data for ${symbol}:`, error);
    return { labels: [], prices: [], volumes: [] };
  }
}

module.exports = {
  getIndexData,
  getMarketData,
  getGainersLosers,
  getVixData,
  getSectoralPerformance,
  getStockList, // Export for testing
  searchStocks,
  getTrendingStocks,
  getStockProfile,
  getStockChartData,
};
