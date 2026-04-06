// hooks/useCurrencyConvert.ts
import { useState, useEffect } from "react";
import { convertGBPtoUSD, convertCADtoUSD } from "../lib/utils";

export function useCurrencyConvert(amount: number, currency: "GBP" | "CAD" | null) {
  const [converted, setConverted] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!amount || !currency) return;

    const convert = async () => {
      setLoading(true);
      try {
        const result = currency === "GBP"
          ? await convertGBPtoUSD(amount)
          : await convertCADtoUSD(amount);
        setConverted(result.usd);
      } catch (err) {
        console.error("Conversion failed:", err);
      } finally {
        setLoading(false);
      }
    };

    convert();
  }, [amount, currency]);

  return { converted, loading };
}