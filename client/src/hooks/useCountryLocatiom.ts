"use client";

import { useEffect, useState } from "react";
import { getUserCountry } from "./index";

export const useUserCountry = () => {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔥 useUserCountry running");

    let mounted = true;

    const fetchCountry = async () => {
      const result = await getUserCountry();

      console.log("🌍 country result:", result);

      if (mounted) {
        setCountry(result);
        setLoading(false);
      }
    };

    fetchCountry();

    return () => {
      mounted = false;
    };
  }, []);

  return { country, loading };
};