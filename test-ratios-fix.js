const { getStockProfile } = require("./src/services/data-fetcher.js");

async function testRatiosFix() {
  console.log("🧪 Testing Financial Ratios Fix\n");

  const testStocks = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"];

  for (const symbol of testStocks) {
    try {
      console.log(`\n📊 Testing ${symbol}:`);
      console.log("─".repeat(40));

      const profile = await getStockProfile(symbol);

      // Check the three ratios we fixed
      const ratios = {
        "Debt/Equity": profile.debtToEquity,
        "ROE (%)": profile.roe,
        "ROA (%)": profile.roa,
      };

      let allRatiosAvailable = true;

      Object.entries(ratios).forEach(([name, value]) => {
        const isAvailable =
          value !== null && value !== undefined && !isNaN(value);
        const status = isAvailable ? "✅" : "❌";
        const displayValue = isAvailable
          ? name.includes("%")
            ? `${Number(value).toFixed(2)}%`
            : Number(value).toFixed(2)
          : "Not Available";

        console.log(`${status} ${name}: ${displayValue}`);

        if (!isAvailable) allRatiosAvailable = false;
      });

      // Also show other key ratios for context
      console.log("\n📈 Other Key Ratios:");
      console.log(
        `   P/E Ratio: ${
          profile.peRatio ? Number(profile.peRatio).toFixed(2) : "N/A"
        }`
      );
      console.log(
        `   P/B Ratio: ${
          profile.pbRatio ? Number(profile.pbRatio).toFixed(2) : "N/A"
        }`
      );
      console.log(
        `   EPS: ₹${profile.eps ? Number(profile.eps).toFixed(2) : "N/A"}`
      );

      if (allRatiosAvailable) {
        console.log("\n🎉 SUCCESS: All financial health ratios are available!");
      } else {
        console.log("\n⚠️  Some ratios are missing");
      }
    } catch (error) {
      console.error(`❌ Error testing ${symbol}:`, error.message);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Financial Ratios Fix Test Complete!");
  console.log("The Debt/Equity, ROE, and ROA ratios should now be");
  console.log("visible in the stock profile screen.");
  console.log("=".repeat(50));
}

testRatiosFix().catch(console.error);
