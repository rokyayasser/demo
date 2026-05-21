// src/services/currency.service.js
// Fetches live USD → EGP rate for display purposes only
// Payments are made in the chosen currency via separate Paymob integrations

const CACHE_MS = 60 * 60 * 1000; // cache 1 hour

let cache = { rate: null, fetchedAt: null };

/** Returns: number — how many EGP equal 1 USD (e.g. 50.5) */
export const getUsdToEgpRate = async () => {
  const now = Date.now();
  if (cache.rate && cache.fetchedAt && now - cache.fetchedAt < CACHE_MS) {
    return cache.rate;
  }
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    const json = await res.json();
    if (json?.rates?.EGP) {
      cache = { rate: json.rates.EGP, fetchedAt: now };
      return json.rates.EGP;
    }
  } catch {
    /* silent */
  }
  try {
    const res = await fetch(
      "https://api.exchangerate.host/latest?base=USD&symbols=EGP",
    );
    const json = await res.json();
    if (json?.rates?.EGP) {
      cache = { rate: json.rates.EGP, fetchedAt: now };
      return json.rates.EGP;
    }
  } catch {
    /* silent */
  }
  return 50; // hardcoded fallback
};

/** Convert EGP amount to USD string e.g. "$12.50" */
export const toUsd = (egp, rate) => {
  if (!egp || !rate) return "$0.00";
  return "$" + (Number(egp) / rate).toFixed(2);
};
