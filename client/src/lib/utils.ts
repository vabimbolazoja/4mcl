import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BASE_URL = "https://api.frankfurter.dev/v2";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FrankfurterV2Rate {
  base: string;
  quote: string;
  date: string;
  rate: number;
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

export interface ConvertToUSDResult {
  amount: number;
  currency: "CAD" | "GBP";
  usd: number;
  rate: number;
  timestamp: string;
}

// ─── Functions ────────────────────────────────────────────────────────────────

export async function getExchangeRates(): Promise<ExchangeRates> {
  const response = await fetch(`${BASE_URL}/rates?base=USD&quotes=CAD,GBP`);

  if (!response.ok) {
    throw new Error(`Failed to fetch rates: ${response.status} ${response.statusText}`);
  }

  const data: FrankfurterV2Rate[] = await response.json();

  const cadEntry = data.find((r) => r.quote === "CAD");
  const gbpEntry = data.find((r) => r.quote === "GBP");

  if (!cadEntry || !gbpEntry) {
    throw new Error("Missing CAD or GBP rate in response.");
  }

  return {
    base: cadEntry.base,
    USD_to_CAD: cadEntry.rate,
    USD_to_GBP: gbpEntry.rate,
    timestamp: cadEntry.date,
  };
}

export async function convertUSD(usdAmount: number): Promise<ConvertUSDResult> {
  if (isNaN(usdAmount) || usdAmount < 0) {
    throw new Error("Invalid amount: must be a non-negative number.");
  }

  const { USD_to_CAD, USD_to_GBP, timestamp } = await getExchangeRates();

  return {
    usd: usdAmount,
    cad: parseFloat((usdAmount * USD_to_CAD).toFixed(2)),
    gbp: parseFloat((usdAmount * USD_to_GBP).toFixed(2)),
    rates: { USD_to_CAD, USD_to_GBP },
    timestamp,
  };
}

export async function convertToCAD(usdAmount: number): Promise<ConvertToCADResult> {
  if (isNaN(usdAmount) || usdAmount < 0) {
    throw new Error("Invalid amount: must be a non-negative number.");
  }

  const { USD_to_CAD, timestamp } = await getExchangeRates();

  return {
    usd: usdAmount,
    cad: parseFloat((usdAmount * USD_to_CAD).toFixed(2)),
    rate: USD_to_CAD,
    timestamp,
  };
}

export async function convertToGBP(usdAmount: number): Promise<ConvertToGBPResult> {
  if (isNaN(usdAmount) || usdAmount < 0) {
    throw new Error("Invalid amount: must be a non-negative number.");
  }

  const { USD_to_GBP, timestamp } = await getExchangeRates();

  return {
    usd: usdAmount,
    gbp: parseFloat((usdAmount * USD_to_GBP).toFixed(2)),
    rate: USD_to_GBP,
    timestamp,
  };
}

export async function convertToUSD(
  amount: number,
  fromCurrency: "CAD" | "GBP"
): Promise<ConvertToUSDResult> {
  if (isNaN(amount) || amount < 0) {
    throw new Error("Invalid amount: must be a non-negative number.");
  }

  const { USD_to_CAD, USD_to_GBP, timestamp } = await getExchangeRates();

  const rateMap: Record<"CAD" | "GBP", number> = {
    CAD: USD_to_CAD,
    GBP: USD_to_GBP,
  };

  const rate = rateMap[fromCurrency];

  return {
    amount,
    currency: fromCurrency,
    usd: parseFloat((amount / rate).toFixed(2)),
    rate,
    timestamp,
  };
}

export async function convertGBPtoUSD(gbpAmount: number): Promise<ConvertToUSDResult> {
  if (isNaN(gbpAmount) || gbpAmount < 0) {
    throw new Error("Invalid amount: must be a non-negative number.");
  }

  const { USD_to_GBP, timestamp } = await getExchangeRates();

  return {
    amount: gbpAmount,
    currency: "GBP",
    usd: parseFloat((gbpAmount / USD_to_GBP).toFixed(2)),
    rate: USD_to_GBP,
    timestamp,
  };
}

export async function convertCADtoUSD(cadAmount: number): Promise<ConvertToUSDResult> {
  if (isNaN(cadAmount) || cadAmount < 0) {
    throw new Error("Invalid amount: must be a non-negative number.");
  }

  const { USD_to_CAD, timestamp } = await getExchangeRates();

  return {
    amount: cadAmount,
    currency: "CAD",
    usd: parseFloat((cadAmount / USD_to_CAD).toFixed(2)),
    rate: USD_to_CAD,
    timestamp,
  };
}