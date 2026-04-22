let countryPromise: Promise<string | null> | null = null;

export const getUserCountry = async (): Promise<string | null> => {
  try {
    const cached = localStorage.getItem("user_country");
    const cachedTime = localStorage.getItem("country_time");

    // Validate cache: exists and not older than 24 hours
    if (cached && cachedTime && Date.now() - Number(cachedTime) < 86_400_000) {
      return cached;
    }

    if (!countryPromise) {
      countryPromise = fetch("https://ipapi.co/json/")
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          const country: string | null = data?.country ?? null;
          if (country) {
            localStorage.setItem("user_country", country);
            localStorage.setItem("country_time", String(Date.now()));
          }
          return country;
        })
        .catch((err) => {
          console.error("Geo error:", err);
          countryPromise = null; // Reset so it can retry next time
          return null;
        });
    }

    return countryPromise;
  } catch (error) {
    console.error("Geo error:", error);
    return null;
  }
};