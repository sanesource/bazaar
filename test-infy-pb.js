const YahooFinance = require("yahoo-finance2").default;
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey", "ripHistorical"],
});

async function testINFYPB() {
  try {
    const yahooSymbol = "INFY.NS";

    console.log("=== TESTING ALTERNATIVE DATA SOURCES FOR INFY P/B ===");

    // Try different modules
    const modules = [
      "balanceSheetHistory",
      "earnings",
      "financialData",
      "summaryProfile",
    ];

    for (const module of modules) {
      try {
        console.log(`\n--- Testing ${module} ---`);
        const data = await yahooFinance.quoteSummary(yahooSymbol, {
          modules: [module],
        });
        if (data[module]) {
          console.log("Available keys:", Object.keys(data[module]));

          if (
            module === "balanceSheetHistory" &&
            data[module].balanceSheetStatements
          ) {
            const latest = data[module].balanceSheetStatements[0];
            console.log("Latest balance sheet keys:", Object.keys(latest));
            console.log(
              "Total Stockholder Equity:",
              latest.totalStockholderEquity?.raw
            );
            console.log(
              "Shares Outstanding from quote:",
              data.sharesOutstanding
            );
          }

          if (module === "financialData") {
            console.log(
              "Financial data:",
              JSON.stringify(data[module], null, 2)
            );
          }
        }
      } catch (e) {
        console.log(`${module} failed:`, e.message);
      }
    }

    // Let's also check what a reasonable P/B should be for INFY
    console.log("\n=== MANUAL P/B CALCULATION ATTEMPT ===");

    // Get basic quote data
    const quote = await yahooFinance.quote(yahooSymbol);
    console.log("Current Price:", quote.regularMarketPrice);
    console.log("Shares Outstanding:", quote.sharesOutstanding);
    console.log("Market Cap:", quote.marketCap);

    // For reference, let's check TCS which should have reasonable P/B
    console.log("\n=== TCS COMPARISON ===");
    const tcsQuote = await yahooFinance.quote("TCS.NS");
    console.log("TCS Price:", tcsQuote.regularMarketPrice);
    console.log("TCS Book Value:", tcsQuote.bookValue);
    console.log("TCS P/B:", tcsQuote.priceToBook);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testINFYPB();
