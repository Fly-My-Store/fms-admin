export const UPDATE_CSV_COLUMNS = [
  'id',
  'sku',
  'product_name',
  'price_rupee',
  'mrp_rupee',
  'max_per_order',
  'stock_status',
  'max_order_qty'
];

function escapeCsvCell(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function centsToRupeeCsv(cents) {
  if (cents == null || cents === '') return '';
  const n = Number(cents);
  if (!Number.isFinite(n)) return '';
  return (n / 100).toFixed(2);
}

export function stockStatusToCsv(status) {
  const raw = String(status || '').toUpperCase();
  if (raw === 'OUT_OF_STOCK') return 'out';
  if (raw === 'IN_STOCK') return 'in';
  return '';
}

export function storeVariantToCsvRow(item) {
  return {
    id: item?.id || '',
    sku: item?.product_variant?.sku || '',
    product_name: item?.product_variant?.product?.name || '',
    price_rupee: centsToRupeeCsv(item?.price_cents),
    mrp_rupee: centsToRupeeCsv(item?.mrp_cents),
    max_per_order: item?.max_per_order != null ? String(item.max_per_order) : '',
    stock_status: stockStatusToCsv(item?.stock_status),
    max_order_qty: item?.max_order_qty != null ? String(item.max_order_qty) : ''
  };
}

export function storeVariantsToCsv(items = []) {
  const lines = [UPDATE_CSV_COLUMNS.join(',')];
  for (const item of items) {
    const row = storeVariantToCsvRow(item);
    lines.push(UPDATE_CSV_COLUMNS.map((h) => escapeCsvCell(row[h])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

export function downloadCsv(filename, text) {
  const blob = new Blob([text], { type: 'text/csv; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
