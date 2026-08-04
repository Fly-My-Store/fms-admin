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
  Avatar
} from '@mui/material';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { RECORD_STATUS } from 'utils/constants';

const nfINR = new Intl.NumberFormat('en-IN');

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
  return primary?.thumb_url || primary?.url || null;
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

function PriceBlock({ price_cents, mrp, sale_price, currency = 'INR', tax_inclusive }) {
  const base = price_cents != null ? Math.round(Number(price_cents) / 100) : null;
  const m = mrp != null ? Number(mrp) : null;
  const s = sale_price != null ? Number(sale_price) : null;

  if (m == null && s == null && base == null) return <Typography variant="body2">—</Typography>;

  return (
    <Stack spacing={0.5}>
      {s != null && m != null && m > 0 && s < m ? (
        <Stack direction="row" spacing={1} alignItems="baseline">
          <Typography variant="subtitle2">
            {currency} {fmtMoney(s)}
          </Typography>
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

export default function ProductVariantsGrid({
  rows = [],
  handleEditButton,
  handleViewButton,
  showProductMeta = false
}) {
  const hasRows = Array.isArray(rows) && rows.length > 0;

  return (
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
        return (
          <Card key={row.id} variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}>
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
                  onClick={() => handleViewButton && handleViewButton(row)}
                />
              ) : (
                <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0 }}>
                  <Avatar variant="rounded">{(row.sku || 'V')[0]}</Avatar>
                </Stack>
              )}
            </Box>

            <CardContent sx={{ flex: 1 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap title={row.sku}>
                    {row.sku || '—'}
                  </Typography>
                  <StatusChip value={row.record_status} />
                </Stack>
                {showProductMeta ? (
                  <Stack spacing={0.25}>
                    <Typography variant="body2" noWrap title={row.product?.name}>
                      {row.product?.name || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {[row.product?.brand?.name, row.product?.category?.name].filter(Boolean).join(' · ') || '—'}
                    </Typography>
                  </Stack>
                ) : null}
                <Typography variant="caption" color="text.secondary" noWrap title={getOptionSummary(row)}>
                  {getOptionSummary(row)}
                </Typography>
                <PriceBlock
                  price_cents={row.price_cents}
                  mrp={row.mrp}
                  sale_price={row.sale_price}
                  currency={row.currency}
                  tax_inclusive={row.tax_inclusive}
                />
              </Stack>
            </CardContent>

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
  );
}

StatusChip.propTypes = { value: PropTypes.any };
PriceBlock.propTypes = {
  price_cents: PropTypes.any,
  mrp: PropTypes.any,
  sale_price: PropTypes.any,
  currency: PropTypes.string,
  tax_inclusive: PropTypes.bool
};

ProductVariantsGrid.propTypes = {
  rows: PropTypes.array,
  handleEditButton: PropTypes.func,
  handleViewButton: PropTypes.func,
  showProductMeta: PropTypes.bool
};
