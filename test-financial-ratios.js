const { getStockProfile } = require("./src/services/data-fetcher");

async function testFinancialRatios() {
  const testSymbols = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"];

  console.log("=== TESTING FINANCIAL RATIOS EXTRACTION ===\n");

  for (const symbol of testSymbols) {
    console.log(`\n--- Testing ${symbol} ---`);

    try {
      const profile = await getStockProfile(symbol);

      console.log(`✓ Stock Profile Retrieved for ${symbol}`);
      console.log(`  Company: ${profile.companyName}`);
      console.log(`  Current Price: ₹${profile.currentPrice}`);

      // Test the key financial ratios
      const ratios = {
        "P/E Ratio": profile.peRatio,
        "P/B Ratio": profile.pbRatio,
        EPS: profile.eps,
        Beta: profile.beta,
        "Dividend Yield": profile.dividendYield,
        "Market Cap": profile.marketCap,
      };

      console.log("\n  Financial Ratios:");
      let availableCount = 0;
      let totalCount = Object.keys(ratios).length;

      for (const [label, value] of Object.entries(ratios)) {
        if (value !== null && value !== undefined && !isNaN(value)) {
          console.log(`    ✅ ${label}: ${formatValue(value, label)}`);
          availableCount++;
        } else {
          console.log(`    ❌ ${label}: Not available`);
        }
      }

      const availability = Math.round((availableCount / totalCount) * 100);
      console.log(
        `\n  📊 Data Availability: ${availableCount}/${totalCount} (${availability}%)`
      );

      if (availability >= 80) {
        console.log(`  🎉 EXCELLENT data coverage for ${symbol}!`);
      } else if (availability >= 60) {
        console.log(`  👍 GOOD data coverage for ${symbol}`);
      } else if (availability >= 40) {
        console.log(`  ⚠️  FAIR data coverage for ${symbol}`);
      } else {
        console.log(`  ❌ POOR data coverage for ${symbol}`);
      }
    } catch (error) {
      console.log(`❌ Error testing ${symbol}:`, error.message);
    }

    // Wait between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\n=== TEST COMPLETE ===");
}

function formatValue(value, label) {
  if (value === null || value === undefined || isNaN(value)) {
    return "N/A";
  }

  switch (label) {
    case "P/E Ratio":
    case "P/B Ratio":
    case "Beta":
      return Number(value).toFixed(2);
    case "EPS":
      return `₹${Number(value).toFixed(2)}`;
    case "Dividend Yield":
      return `${(Number(value) * 100).toFixed(2)}%`;
    case "Market Cap":
      if (value >= 10000000000000) {
        // 10 trillion
        return `₹${(value / 10000000000000).toFixed(2)} Lakh Cr`;
      } else if (value >= 1000000000000) {
        // 1 trillion
        return `₹${(value / 1000000000000).toFixed(2)} Thousand Cr`;
      } else if (value >= 10000000000) {
        // 10 billion
        return `₹${(value / 10000000000).toFixed(2)} Thousand Cr`;
      } else if (value >= 10000000) {
        // 10 million
        return `₹${(value / 10000000).toFixed(2)} Cr`;
      } else {
        return `₹${value.toLocaleString("en-IN")}`;
      }
    default:
      return value.toString();
  }
}

// Run the test
testFinancialRatios().catch(console.error);
