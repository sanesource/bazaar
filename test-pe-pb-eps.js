const { getStockProfile } = require("./src/services/data-fetcher");

async function testPePbEps() {
  console.log("🎯 FOCUSED TEST: PE, PB, EPS Extraction");
  console.log("=".repeat(50));

  const testSymbols = ["RELIANCE", "TCS", "INFY"];

  for (const symbol of testSymbols) {
    console.log(`\n📊 Testing ${symbol}:`);

    try {
      const profile = await getStockProfile(symbol);

      // Test the three key ratios
      const tests = [
        {
          name: "P/E Ratio",
          value: profile.peRatio,
          expected: "number",
          range: [5, 100], // Reasonable range for Indian stocks
        },
        {
          name: "P/B Ratio",
          value: profile.pbRatio,
          expected: "number",
          range: [0.5, 50], // Reasonable range
        },
        {
          name: "EPS",
          value: profile.eps,
          expected: "number",
          range: [1, 500], // Reasonable range for Indian stocks
        },
      ];

      let passedTests = 0;

      for (const test of tests) {
        const isValid =
          test.value !== null &&
          test.value !== undefined &&
          !isNaN(test.value) &&
          test.value >= test.range[0] &&
          test.value <= test.range[1];

        if (isValid) {
          console.log(`  ✅ ${test.name}: ${test.value.toFixed(2)} ✓`);
          passedTests++;
        } else {
          console.log(
            `  ❌ ${test.name}: ${test.value} (Invalid or out of range)`
          );
        }
      }

      const score = Math.round((passedTests / tests.length) * 100);
      console.log(`  📈 Score: ${passedTests}/${tests.length} (${score}%)`);

      if (score === 100) {
        console.log(
          `  🎉 PERFECT! All ratios extracted successfully for ${symbol}`
        );
      } else if (score >= 67) {
        console.log(`  👍 GOOD! Most ratios working for ${symbol}`);
      } else {
        console.log(`  ⚠️  NEEDS WORK! Some ratios missing for ${symbol}`);
      }
    } catch (error) {
      console.log(`  💥 ERROR: ${error.message}`);
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ PE, PB, EPS Test Complete!");
}

testPePbEps().catch(console.error);
