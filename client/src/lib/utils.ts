import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Real-Time Currency Converter — USD to CAD & GBP
 * Powered by: https://www.frankfurter.app (free, no API key needed)
 *
 * Functions:
 *  - getExchangeRates()    → fetch live USD → CAD & GBP rates
 *  - convertUSD(amount)    → convert a USD amount to both CAD and GBP
 *  - convertToCAD(amount)  → convert USD to CAD only
 *  - convertToGBP(amount)  → convert USD to GBP only
 */

const BASE_URL = "https://api.frankfurter.app";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FrankfurterResponse {
  base: string;
  date: string;
  rates: {
    CAD: number;
    GBP: number;
  };
}

export interface ExchangeRates {
  base: string;
  USD_to_CAD: number;
  USD_to_GBP: number;
  timestamp: string;
}

export interface ConvertUSDResult {
  usd: number;
  cad: number;
  gbp: number;
  rates: {
    USD_to_CAD: number;
    USD_to_GBP: number;
  };
  timestamp: string;
}

export interface ConvertToCADResult {
  usd: number;
  cad: number;
  rate: number;
  timestamp: string;
}

export interface ConvertToGBPResult {
  usd: number;
  gbp: number;
  rate: number;
  timestamp: string;
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Fetches the latest exchange rates from USD to CAD and GBP.
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  const response = await fetch(`${BASE_URL}/latest?from=USD&to=CAD,GBP`);

  if (!response.ok) {
    throw new Error(`Failed to fetch rates: ${response.status} ${response.statusText}`);
  }

  const data: FrankfurterResponse = await response.json();

  return {
    base: data.base,
    USD_to_CAD: data.rates.CAD,
    USD_to_GBP: data.rates.GBP,
    timestamp: data.date,
  };
}

/**
 * Converts a USD amount to both CAD and GBP.
 * @param usdAmount - The amount in USD to convert. Must be a non-negative number.
 */
export async function convertUSD(usdAmount: number): Promise<ConvertUSDResult> {
  if (isNaN(usdAmount) || usdAmount < 0) {
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
 * Converts a USD amount to Canadian Dollars (CAD) only.
 * @param usdAmount - The amount in USD to convert.
 */
export async function convertToCAD(usdAmount: number): Promise<ConvertToCADResult> {
  if (isNaN(usdAmount) || usdAmount < 0) {
    throw new Error("Invalid amount: must be a non-negative number.");
  }

  const { USD_to_CAD, timestamp } = await getExchangeRates();

  return parseFloat((usdAmount * USD_to_CAD).toFixed(2));
  
}

/**
 * Converts a USD amount to British Pounds (GBP) only.
 * @param usdAmount - The amount in USD to convert.
 */
export async function convertToGBP(usdAmount: number): Promise<ConvertToGBPResult> {
  if (isNaN(usdAmount) || usdAmount < 0) {
    throw new Error("Invalid amount: must be a non-negative number.");
  }

  const { USD_to_GBP, timestamp } = await getExchangeRates();

  return parseFloat((usdAmount * USD_to_GBP).toFixed(2));
    
}

// ─── Example usage ────────────────────────────────────────────────────────────

(async () => {
  try {
    const amount = 100;

    console.log("=== Real-Time Currency Converter ===\n");

    const result: ConvertUSDResult = await convertUSD(amount);
    console.log(`$${result.usd} USD =`);
    console.log(`  $${result.cad} CAD  (rate: ${result.rates.USD_to_CAD})`);
    console.log(`  £${result.gbp} GBP  (rate: ${result.rates.USD_to_GBP})`);
    console.log(`  Rate date: ${result.timestamp}\n`);

    const cadOnly: ConvertToCADResult = await convertToCAD(250);
    console.log(`$${cadOnly.usd} USD → $${cadOnly.cad} CAD`);

    const gbpOnly: ConvertToGBPResult = await convertToGBP(500);
    console.log(`$${gbpOnly.usd} USD → £${gbpOnly.gbp} GBP`);

  } catch (err) {
    if (err instanceof Error) {
      console.error("Error:", err.message);
    }
  }
})();