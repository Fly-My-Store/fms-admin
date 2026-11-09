export const GOOGLE_MAPS_PRICING = {
  currency: 'INR',
  verifiedOn: '2026-11-05',
  source: 'https://developers.google.com/maps/billing-and-pricing/pricing',
  exchangeRateSource: 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR',
  fallbackUsdToInr: 84.5,
  services: {
    GEOCODING: { sku: 'Geocoding', usdPer1000: 5, monthlyFreeEvents: 10000 },
    ROUTES: { sku: 'Routes: Compute Routes Essentials', usdPer1000: 5, monthlyFreeEvents: 10000 },
    ROUTE_MATRIX: { sku: 'Routes: Compute Route Matrix Essentials', usdPer1000: 5, monthlyFreeEvents: 10000 },
    DISTANCE_MATRIX: { sku: 'Distance Matrix (historical)', usdPer1000: 5, monthlyFreeEvents: 10000 },
    PLACES: { sku: 'Place Details Essentials', usdPer1000: 5, monthlyFreeEvents: 10000 },
    DYNAMIC_MAPS: { sku: 'Dynamic Maps', usdPer1000: 7, monthlyFreeEvents: 10000 },
    MAPS_SDK: { sku: 'Maps SDK', usdPer1000: 0, monthlyFreeEvents: null }
  }
};

export function estimateMapsCostInr(counts = {}, usdToInr = GOOGLE_MAPS_PRICING.fallbackUsdToInr) {
  const usd = Object.entries(counts).reduce((total, [service, count]) => {
    const rate = GOOGLE_MAPS_PRICING.services[service]?.usdPer1000 || 0;
    return total + ((Number(count) || 0) * rate) / 1000;
  }, 0);
  return usd * (Number(usdToInr) || GOOGLE_MAPS_PRICING.fallbackUsdToInr);
}

export function formatEstimatedCostInr(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: GOOGLE_MAPS_PRICING.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(Number(value) || 0);
}
