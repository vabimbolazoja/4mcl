import { useState, useEffect } from "react";
import { convertToCAD, convertToGBP, convertToUSD, convertUSD } from "@/lib/utils";

export default function CurrencyDisplay() {
  const [cadResult, setCadResult] = useState(null);
  const [gbpResult, setGbpResult] = useState(null);
  const [usdResult, setUsdResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // ✅ Call all at once in parallel
        const [cad, gbp, usd] = await Promise.all([
          convertToCAD(200),
          convertToGBP(200),
          convertToUSD(200, "CAD"),
        ]);

        setCadResult(cad);   // { usd, cad, rate, timestamp }
        setGbpResult(gbp);   // { usd, gbp, rate, timestamp }
        setUsdResult(usd);   // { amount, currency, usd, rate, timestamp }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []); // runs once on mount

  if (loading) return <p>Loading rates...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <p>$200 USD → ${cadResult?.cad} CAD (rate: {cadResult?.rate})</p>
      <p>$200 USD → £{gbpResult?.gbp} GBP (rate: {gbpResult?.rate})</p>
      <p>$200 CAD → ${usdResult?.usd} USD (rate: {usdResult?.rate})</p>
    </div>
  );
}