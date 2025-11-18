'use client';

import PropTypes from 'prop-types';
import {
  Box,
  Stack,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Avatar,
  Tooltip,
  Pagination,
  TextField,
  MenuItem,
  Divider
} from '@mui/material';
import { EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { RECORD_STATUS } from 'utils/constants';

// =============== Helpers ===============
const nfINR = new Intl.NumberFormat('en-IN');
const curr = (c) => (c || 'INR');

function fmtMoney(n) {
  if (n == null) return null;
  const num = Number(n);
  if (Number.isNaN(num)) return null;
  return nfINR.format(num);
}

function getFirstImage(row) {
  const imgs = Array.isArray(row?.images) ? row.images : [];
  if (!imgs.length) return null;
  const primary = imgs.find((i) => i?.is_primary) || imgs[0];
  return primary?.url || null;
}

function getOptionSummary(row) {
  if (row?.option_summary) return String(row.option_summary);
  const attrs = row?.attributes || {};
  if (attrs && typeof attrs === 'object' && !Array.isArray(attrs)) {
    const parts = Object.keys(attrs).map((k) => `${k}: ${attrs[k]}`);
    if (parts.length) return parts.join(' · ');
  }
  return '—';
}

function StatusChip({ value }) {
  switch (value) {
    case RECORD_STATUS.ACTIVE:
      return <Chip color="success" label="Active" size="small" variant="light" />;
    case RECORD_STATUS.INACTIVE:
      return <Chip color="warning" label="Inactive" size="small" variant="light" />;
    case RECORD_STATUS.ARCHIVED:
      return <Chip color="error" label="Archived" size="small" variant="light" />;
    default:
      return <Chip color="default" label="Unknown" size="small" variant="light" />;
  }
}

// =============== Price Block ===============
function PriceBlock({ price_cents, mrp, sale_price, currency = 'INR', tax_inclusive }) {
  const base = price_cents != null ? Math.round(Number(price_cents) / 100) : null;
  const m = mrp != null ? Number(mrp) : null;
  const s = sale_price != null ? Number(sale_price) : null;

  if (m == null && s == null && base == null) return <Typography variant="body2">—</Typography>;

  return (
    <Stack spacing={0.5}>
      {s != null && m != null && m > 0 && s < m ? (
        <Stack direction="row" spacing={1} alignItems="baseline">
          <Typography variant="subtitle2">{currency} {fmtMoney(s)}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
            {currency} {fmtMoney(m)}
          </Typography>
          <Chip size="small" color="success" label={`-${Math.round(((m - s) / m) * 100)}%`} variant="light" />
        </Stack>
      ) : (
        (s != null || m != null) && (
          <Typography variant="subtitle2">
            {currency} {fmtMoney(s != null ? s : m)}
          </Typography>
        )
      )}

      {base != null && (
        <Typography variant="caption" color="text.secondary">
          Base: {currency} {fmtMoney(base)} {tax_inclusive ? '(tax incl.)' : ''}
        </Typography>
      )}
    </Stack>
  );
}

// =============== Main ===============
export default function ProductVariantsGrid({
  rows = [],
  handleAddButton,
  handleEditButton,
  handleViewButton,
  pageIndex = 0,
  pageSize = 20,
  totalPageCount = 1,
  onPaginationChange,
  totalCount = 0
}) {
  const hasRows = Array.isArray(rows) && rows.length > 0;

  const pageSizeOptions = [10, 20, 50, 100];

  const handlePageChange = (_e, page) => {
    if (typeof onPaginationChange === 'function') onPaginationChange({ pageIndex: page - 1, pageSize });
  };
  const handlePageSizeChange = (e) => {
    const nextSize = Number(e.target.value) || pageSize;
    if (typeof onPaginationChange === 'function') onPaginationChange({ pageIndex: 0, pageSize: nextSize });
  };

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {/* Header actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Product Variants{`(${totalCount})`}</Typography>
        <Button onClick={handleAddButton} startIcon={<PlusOutlined />} variant="contained" size="small">
          Add Variant
        </Button>
      </Stack>

      {/* Card grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 2
        }}
      >
        {!hasRows && (
          <Box sx={{ gridColumn: '1 / -1', py: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">No variants found.</Typography>
          </Box>
        )}

        {rows.map((row) => {
          const img = getFirstImage(row);
          const sw = row?.color_hex;
          return (
            <Card key={row.id} variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}>
              {/* Media */}
              <Box
                sx={{
                  position: 'relative',
                  pt: '56.25%',
                  bgcolor: 'grey.100',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {img ? (
                  <Box
                    component="img"
                    src={img}
                    alt={row.sku || 'variant'}
                    sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    onClick={() => handleEditButton && handleEditButton(row)}
                  />
                ) : (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{ position: 'absolute', inset: 0 }}
                    onClick={() => handleEditButton && handleEditButton(row)}
                  >
                    <Avatar sx={{ width: 56, height: 56 }}>{(row?.sku || 'NA').slice(0, 2).toUpperCase()}</Avatar>
                  </Stack>
                )}
              </Box>

              {/* Body */}
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={0.75}>
                  {/* Title row */}
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1" noWrap title={row.sku}>
                      {row.sku || '—'}
                    </Typography>
                    <StatusChip value={row.record_status} />
                  </Stack>

                  {/* Price */}
                  <PriceBlock
                    price_cents={row?.price_cents}
                    mrp={row?.mrp}
                    sale_price={row?.sale_price}
                    currency={curr(row?.currency)}
                    tax_inclusive={!!row?.tax_inclusive}
                  />

                  <Typography variant="h7" >
                    Barcode  : {row.barcode || ''}
                  </Typography>
                  <Typography variant="h7" >
                    GTIN  : {row.gtin || ''}
                  </Typography>
                  <Typography variant="h7"  >
                    MPN  : {row.mpn || ''}
                  </Typography>
                </Stack>
              </CardContent>

              {/* Actions */}
              <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                <Button size="small" startIcon={<EyeOutlined />} onClick={() => handleViewButton && handleViewButton(row)}>
                  View
                </Button>
                <Button size="small" startIcon={<EditOutlined />} onClick={() => handleEditButton && handleEditButton(row)}>
                  Edit
                </Button>
              </CardActions>
            </Card>
          );
        })}
      </Box>

      {/* Pagination */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">Rows per page:</Typography>
          <TextField select size="small" value={pageSize} onChange={handlePageSizeChange} sx={{ width: 100 }}>
            {pageSizeOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
        </Stack>
        <Pagination
          color="primary"
          count={Math.max(totalPageCount || 1, 1)}
          page={(pageIndex || 0) + 1}
          onChange={handlePageChange}
          siblingCount={1}
          boundaryCount={1}
          showFirstButton
          showLastButton
        />
      </Stack>
    </Stack>
  );
}

StatusChip.propTypes = { value: PropTypes.string };
PriceBlock.propTypes = {
  price_cents: PropTypes.any,
  mrp: PropTypes.any,
  sale_price: PropTypes.any,
  currency: PropTypes.string,
  tax_inclusive: PropTypes.bool
};

ProductVariantsGrid.propTypes = {
  rows: PropTypes.array,
  handleAddButton: PropTypes.func,
  handleEditButton: PropTypes.func,
  pageIndex: PropTypes.number,
  pageSize: PropTypes.number,
  totalPageCount: PropTypes.number,
  onPaginationChange: PropTypes.func
};
