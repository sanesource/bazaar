const { NseIndia } = require("stock-nse-india");
const YahooFinance = require("yahoo-finance2").default;

const nseIndia = new NseIndia();
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey", "ripHistorical"],
});

async function debugStockData(symbol) {
  console.log(`\n=== DEBUG DATA FOR ${symbol} ===\n`);

  try {
    // 1. NSE Equity Details
    console.log("1. NSE EQUITY DETAILS:");
    const quoteData = await nseIndia.getEquityDetails(symbol);

    if (quoteData) {
      console.log("priceInfo keys:", Object.keys(quoteData.priceInfo || {}));
      console.log("info keys:", Object.keys(quoteData.info || {}));
      console.log("metadata keys:", Object.keys(quoteData.metadata || {}));
      console.log(
        "securityInfo keys:",
        Object.keys(quoteData.securityInfo || {})
      );

      // Check for PE/PB/EPS in all sections
      const priceInfo = quoteData.priceInfo || {};
      const info = quoteData.info || {};
      const metadata = quoteData.metadata || {};
      const securityInfo = quoteData.securityInfo || {};

      console.log("\nFinancial ratios in priceInfo:");
      console.log("  pe:", priceInfo.pe);
      console.log("  pb:", priceInfo.pb);
      console.log("  eps:", priceInfo.eps);

      console.log("\nFinancial ratios in info:");
      console.log("  pe:", info.pe);
      console.log("  pb:", info.pb);
      console.log("  eps:", info.eps);

      console.log("\nFinancial ratios in metadata:");
      console.log("  pe:", metadata.pe);
      console.log("  pb:", metadata.pb);
      console.log("  eps:", metadata.eps);

      console.log("\nFinancial ratios in securityInfo:");
      console.log("  pe:", securityInfo.pe);
      console.log("  pb:", securityInfo.pb);
      console.log("  eps:", securityInfo.eps);

      // Print full objects to see what's available
      console.log("\nFull priceInfo:", JSON.stringify(priceInfo, null, 2));
    }

    // 2. NSE Corporate Info
    console.log("\n2. NSE CORPORATE INFO:");
    try {
      const corporateInfo = await nseIndia.getEquityCorporateInfo(symbol);
      console.log("Corporate info keys:", Object.keys(corporateInfo || {}));
      console.log("Corporate info:", JSON.stringify(corporateInfo, null, 2));
    } catch (e) {
      console.log("Corporate info error:", e.message);
    }

    // 3. Yahoo Finance
    console.log("\n3. YAHOO FINANCE:");
    try {
      const yahooSymbol = `${symbol}.NS`;
      const yahooData = await yahooFinance.quoteSummary(yahooSymbol, {
        modules: [
          "defaultKeyStatistics",
          "financialData",
          "summaryDetail",
          "price",
        ],
      });

      if (yahooData) {
        console.log("Yahoo modules available:", Object.keys(yahooData));

        const keyStats = yahooData.defaultKeyStatistics || {};
        const financialData = yahooData.financialData || {};
        const summaryDetail = yahooData.summaryDetail || {};

        console.log("\nYahoo defaultKeyStatistics:");
        console.log("  trailingPE:", keyStats.trailingPE);
        console.log("  forwardPE:", keyStats.forwardPE);
        console.log("  priceToBook:", keyStats.priceToBook);
        console.log("  trailingEps:", keyStats.trailingEps);
        console.log("  bookValue:", keyStats.bookValue);
        console.log("  beta:", keyStats.beta);

        console.log("\nYahoo financialData:");
        console.log("  trailingEps:", financialData.trailingEps);
        console.log("  currentPrice:", financialData.currentPrice);

        console.log("\nYahoo summaryDetail:");
        console.log("  dividendYield:", summaryDetail.dividendYield);
        console.log("  marketCap:", summaryDetail.marketCap);
      }
    } catch (e) {
      console.log("Yahoo Finance error:", e.message);
    }

    // 4. Try alternative Yahoo Finance approach
    console.log("\n4. YAHOO FINANCE QUOTE:");
    try {
      const yahooSymbol = `${symbol}.NS`;
      const quote = await yahooFinance.quote(yahooSymbol);
      console.log("Yahoo quote keys:", Object.keys(quote || {}));
      console.log("Yahoo quote:", JSON.stringify(quote, null, 2));
    } catch (e) {
      console.log("Yahoo quote error:", e.message);
    }

    // 5. Try NSE pre-open data
    console.log("\n5. NSE PRE-OPEN DATA:");
    try {
      const preOpenData = await nseIndia.getPreOpenMarketData();
      const stockData = preOpenData.data?.find(
        (item) => item.metadata?.symbol === symbol
      );
      if (stockData) {
        console.log(
          "Pre-open metadata:",
          JSON.stringify(stockData.metadata, null, 2)
        );
      } else {
        console.log("Stock not found in pre-open data");
      }
    } catch (e) {
      console.log("Pre-open data error:", e.message);
    }
  } catch (error) {
    console.error("Debug error:", error);
  }
}

// Test with popular stocks
async function runTests() {
  const testSymbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"];

  for (const symbol of testSymbols) {
    await debugStockData(symbol);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds between calls
  }
}

runTests().catch(console.error);
