/**
 * Real-Time Currency Converter — USD to CAD & GBP
 * Powered by: https://www.frankfurter.app (free, no API key needed)
 *
 * Functions:
 *  - getExchangeRates()         → fetch live USD → CAD & GBP rates
 *  - convertUSD(amount)         → convert a USD amount to both CAD and GBP
 *  - convertToCAD(amount)       → convert USD to CAD only
 *  - convertToGBP(amount)       → convert USD to GBP only
 */

const BASE_URL = "https://api.frankfurter.app";

/**
 * Fetches the latest exchange rates from USD to CAD and GBP.
 * @returns {Promise<{ USD_to_CAD: number, USD_to_GBP: number, timestamp: string }>}
 */
async function getExchangeRates() {
  const response = await fetch(`${BASE_URL}/latest?from=USD&to=CAD,GBP`);

  if (!response.ok) {
    throw new Error(`Failed to fetch rates: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return {
    base: data.base,               // "USD"
    USD_to_CAD: data.rates.CAD,    // e.g. 1.36
    USD_to_GBP: data.rates.GBP,    // e.g. 0.79
    timestamp: data.date,          // e.g. "2025-03-26"
  };
}

/**
 * Converts a USD amount to both CAD and GBP.
 * @param {number} usdAmount - The amount in USD to convert.
 * @returns {Promise<{ usd: number, cad: number, gbp: number, rates: object, timestamp: string }>}
 */
async function convertUSD(usdAmount) {
  if (typeof usdAmount !== "number" || isNaN(usdAmount) || usdAmount < 0) {
    throw new Error("Invalid amount: must be a non-negative number.");
  }

  const { USD_to_CAD, USD_to_GBP, timestamp } = await getExchangeRates();

  return {
    usd: usdAmount,
    cad: parseFloat((usdAmount * USD_to_CAD).toFixed(2)),
    gbp: parseFloat((usdAmount * USD_to_GBP).toFixed(2)),
    rates: {
      USD_to_CAD,
      USD_to_GBP,
    },
    timestamp,
  };
}

/**
 * Converts a USD amount to Canadian Dollars (CAD).
 * @param {number} usdAmount
 * @returns {Promise<{ usd: number, cad: number, rate: number, timestamp: string }>}
 */
async function convertToCAD(usdAmount) {
  const { USD_to_CAD, timestamp } = await getExchangeRates();
  return {
    usd: usdAmount,
    cad: parseFloat((usdAmount * USD_to_CAD).toFixed(2)),
    rate: USD_to_CAD,
    timestamp,
  };
}

/**
 * Converts a USD amount to British Pounds (GBP).
 * @param {number} usdAmount
 * @returns {Promise<{ usd: number, gbp: number, rate: number, timestamp: string }>}
 */
async function convertToGBP(usdAmount) {
  const { USD_to_GBP, timestamp } = await getExchangeRates();
  return {
    usd: usdAmount,
    gbp: parseFloat((usdAmount * USD_to_GBP).toFixed(2)),
    rate: USD_to_GBP,
    timestamp,
  };
}


// ─── EXAMPLE USAGE ────────────────────────────────────────────────────────────
(async () => {
  try {
    const amount = 100; // $100 USD

    console.log("=== Real-Time Currency Converter ===\n");

    // Full conversion
    const result = await convertUSD(amount);
    console.log(`💵 $${result.usd} USD =`);
    console.log(`  🇨🇦 $${result.cad} CAD  (rate: ${result.rates.USD_to_CAD})`);
    console.log(`  🇬🇧 £${result.gbp} GBP  (rate: ${result.rates.USD_to_GBP})`);
    console.log(`  📅 Rate date: ${result.timestamp}\n`);

    // CAD only
    const cadOnly = await convertToCAD(250);
    console.log(`💵 $${cadOnly.usd} USD → 🇨🇦 $${cadOnly.cad} CAD`);

    // GBP only
    const gbpOnly = await convertToGBP(500);
    console.log(`💵 $${gbpOnly.usd} USD → 🇬🇧 £${gbpOnly.gbp} GBP`);

  } catch (err) {
    console.error("Error:", err.message);
  }
})();


// ─── EXPORTS (for use as a module) ────────────────────────────────────────────
// If using Node.js with CommonJS:
// module.exports = { getExchangeRates, convertUSD, convertToCAD, convertToGBP };

// If using ES Modules:
export { getExchangeRates, convertUSD, convertToCAD, convertToGBP };