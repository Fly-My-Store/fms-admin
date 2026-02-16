/**
 * All amounts in API/DB are in paisa (cents). Display in rupees (₹).
 */
const nfINR = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export function centsToRupees(cents) {
  const n = Number(cents);
  if (!Number.isFinite(n)) return '';
  return (n / 100).toFixed(2);
}

export function rupeesToCents(rupees) {
  const n = Number(rupees);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export function formatINR(cents) {
  const n = Number(cents);
  if (!Number.isFinite(n)) return '—';
  return `₹${nfINR.format(n / 100)}`;
}
