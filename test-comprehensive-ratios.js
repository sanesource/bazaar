const { getStockProfile } = require("./src/services/data-fetcher");

async function comprehensiveTest() {
  console.log("🧪 COMPREHENSIVE FINANCIAL RATIOS TEST SUITE");
  console.log("=".repeat(60));

  const testCases = [
    {
      category: "Large Cap IT",
      symbols: ["TCS", "INFY", "WIPRO", "HCLTECH"],
    },
    {
      category: "Banking & Finance",
      symbols: ["HDFCBANK", "ICICIBANK", "SBIN", "KOTAKBANK"],
    },
    {
      category: "Conglomerates",
      symbols: ["RELIANCE", "ITC", "ADANIPORTS"],
    },
    {
      category: "Pharma",
      symbols: ["SUNPHARMA", "DRREDDY", "CIPLA"],
    },
  ];

  const results = {
    totalTested: 0,
    successful: 0,
    failed: 0,
    ratioStats: {
      peRatio: { available: 0, total: 0 },
      pbRatio: { available: 0, total: 0 },
      eps: { available: 0, total: 0 },
      beta: { available: 0, total: 0 },
      dividendYield: { available: 0, total: 0 },
      marketCap: { available: 0, total: 0 },
    },
  };

  for (const testCase of testCases) {
    console.log(`\n📊 Testing ${testCase.category}`);
    console.log("-".repeat(40));

    for (const symbol of testCase.symbols) {
      results.totalTested++;

      try {
        const profile = await getStockProfile(symbol);
        results.successful++;

        // Test each ratio
        const ratios = {
          peRatio: profile.peRatio,
          pbRatio: profile.pbRatio,
          eps: profile.eps,
          beta: profile.beta,
          dividendYield: profile.dividendYield,
          marketCap: profile.marketCap,
        };

        let availableCount = 0;
        for (const [key, value] of Object.entries(ratios)) {
          results.ratioStats[key].total++;
          if (value !== null && value !== undefined && !isNaN(value)) {
            results.ratioStats[key].available++;
            availableCount++;
          }
        }

        const coverage = Math.round((availableCount / 6) * 100);
        const status = coverage >= 90 ? "🟢" : coverage >= 70 ? "🟡" : "🔴";

        console.log(
          `  ${status} ${symbol.padEnd(
            12
          )} | Coverage: ${coverage}% | PE: ${formatRatio(
            ratios.peRatio
          )} | PB: ${formatRatio(ratios.pbRatio)} | EPS: ₹${formatRatio(
            ratios.eps
          )}`
        );
      } catch (error) {
        results.failed++;
        console.log(`  🔴 ${symbol.padEnd(12)} | ERROR: ${error.message}`);
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📈 TEST SUMMARY");
  console.log("=".repeat(60));

  console.log(`Total Stocks Tested: ${results.totalTested}`);
  console.log(
    `Successful: ${results.successful} (${Math.round(
      (results.successful / results.totalTested) * 100
    )}%)`
  );
  console.log(
    `Failed: ${results.failed} (${Math.round(
      (results.failed / results.totalTested) * 100
    )}%)`
  );

  console.log("\n📊 RATIO AVAILABILITY:");
  for (const [ratio, stats] of Object.entries(results.ratioStats)) {
    const percentage = Math.round((stats.available / stats.total) * 100);
    const status = percentage >= 90 ? "🟢" : percentage >= 70 ? "🟡" : "🔴";
    console.log(
      `  ${status} ${ratio.padEnd(15)}: ${stats.available}/${
        stats.total
      } (${percentage}%)`
    );
  }

  // Overall grade
  const overallAvailability =
    (Object.values(results.ratioStats).reduce(
      (sum, stat) => sum + stat.available / stat.total,
      0
    ) /
      6) *
    100;

  console.log(`\n🎯 OVERALL DATA QUALITY: ${overallAvailability.toFixed(1)}%`);

  if (overallAvailability >= 90) {
    console.log("🏆 EXCELLENT! Financial ratios are working perfectly!");
  } else if (overallAvailability >= 80) {
    console.log("👍 VERY GOOD! Most financial ratios are available.");
  } else if (overallAvailability >= 70) {
    console.log("✅ GOOD! Financial ratios are mostly working.");
  } else {
    console.log("⚠️  NEEDS IMPROVEMENT! Some ratios need better data sources.");
  }
}

function formatRatio(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return "—";
  }
  return Number(value).toFixed(2);
}

// Run comprehensive test
comprehensiveTest().catch(console.error);
