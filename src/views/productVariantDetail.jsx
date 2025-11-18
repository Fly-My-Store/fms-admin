'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';

import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Tooltip,
  Typography,
  Button
} from '@mui/material';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { actions as catalog } from 'store/catalog/slice';
import { ProductVarientAttrsView } from './productVarientAttributes';

// ========= helpers =========
const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const StatusChip = ({ value }) => {
  const map = {
    DRAFT: { color: 'default', label: 'Draft' },
    SUBMITTED: { color: 'warning', label: 'Submitted' },
    APPROVED: { color: 'success', label: 'Approved' },
    REJECTED: { color: 'error', label: 'Rejected' },
    DISABLED: { color: 'default', label: 'Disabled' }
  };
  const meta = map?.[value] ?? { color: 'default', label: safe(value) };
  return <Chip size="small" color={meta.color} label={meta.label} variant="light" />;
};

const RecordStatusChip = ({ value }) => {
  const map = {
    1: { color: 'success', label: 'Active' },
    2: { color: 'warning', label: 'Inactive' },
    3: { color: 'default', label: 'Archived' }
  };
  const meta = map?.[value] ?? { color: 'default', label: safe(value) };
  return <Chip size="small" color={meta.color} label={meta.label} variant="light" />;
};

function Field({ label, value, mono = false }) {
  const content = safe(value);
  const body = (
    <Typography
      variant="body2"
      sx={{ fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined, wordBreak: 'break-word' }}
    >
      {content}
    </Typography>
  );
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      {String(content).length > 36 ? <Tooltip title={String(content)}>{body}</Tooltip> : body}
    </Stack>
  );
}

function PriceBlock({ price_cents, mrp, sale_price, currency = 'INR', tax_inclusive }) {
  const nf = new Intl.NumberFormat('en-IN');
  const base = price_cents != null ? Math.round(Number(price_cents) / 100) : null;
  const m = mrp != null ? Number(mrp) : null;
  const s = sale_price != null ? Number(sale_price) : null;

  if (m == null && s == null && base == null) return <Typography variant="body2">—</Typography>;

  return (
    <Stack spacing={0.5}>
      {s != null && m != null && m > 0 && s < m ? (
        <Stack direction="row" spacing={1} alignItems="baseline">
          <Typography variant="subtitle2">{currency} {nf.format(s)}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
            {currency} {nf.format(m)}
          </Typography>
          <Chip size="small" color="success" label={`-${Math.round(((m - s) / m) * 100)}%`} variant="light" />
        </Stack>
      ) : (
        (s != null || m != null) && (
          <Typography variant="subtitle2">
            {currency} {nf.format(s != null ? s : m)}
          </Typography>
        )
      )}

      {base != null && (
        <Typography variant="caption" color="text.secondary">
          Base: {currency} {nf.format(base)} {tax_inclusive ? '(tax incl.)' : ''}
        </Typography>
      )}
    </Stack>
  );
}

function AttrSummary({ attrs }) {
  if (!attrs || typeof attrs !== 'object' || Array.isArray(attrs)) return <Typography variant="body2">—</Typography>;
  const parts = Object.keys(attrs).map((k) => `${k}: ${attrs[k]}`);
  return <Typography variant="body2" color="text.secondary">{parts.join(' · ') || '—'}</Typography>;
}

// ========= page =========
export default function VariantDetailView() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const product_id_from_query = search?.get('p');
  const product_name_from_query = search?.get('n');
  const id = params?.id;

  const { variantDetail } = useSelector((s) => s.catalog || {});
  const detail = variantDetail || { data: null, loading: false, error: null };
  const data = detail.data;
  const images = Array.isArray(data?.images) ? data.images : [];

  const primaryImage = (data?.images || []).find((im) => im.is_primary) || data?.images?.[0] || null;

  const breadcrumb = useMemo(() => {
    const name = data?.sku || id || 'product-variant';
    return {
      heading: 'product-variant',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'products', to: '/products' },
        { title: `${product_id_from_query}-${product_name_from_query}`, to: `/products/${product_id_from_query}`, i18n: false },
        { title: 'product-variants', to: `/products/${product_id_from_query}?t=variants` },
        { title: name, i18n: false }
      ]
    };
  }, [data?.sku, id]);

  useEffect(() => {
    if (!id) return;
    dispatch(catalog.variantsGetRequest({ params: { id } }));
  }, [dispatch, id]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard border={false} boxShadow>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Left summary (variant-specific) */}
          <Stack flex={3} spacing={2}>
            {detail.loading && <Alert severity="info">Loading…</Alert>}
            {!detail.loading && data && (
              <>
                {/* Header */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar variant="rounded" src={primaryImage?.url || ''} sx={{ width: 72, height: 72, borderRadius: 1 }}>
                    {!primaryImage?.url ? (data?.sku || 'V')[0] : null}
                  </Avatar>
                  <Stack>
                    <Typography variant="h6">{data?.sku || '—'}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <StatusChip value={data?.status} />
                      <RecordStatusChip value={data?.record_status} />
                      {data?.is_active != null && (
                        <Chip size="small" variant="light" color={data.is_active ? 'success' : 'default'} label={data.is_active ? 'Active' : 'Inactive'} />
                      )}
                    </Stack>
                  </Stack>
                </Stack>

                <Divider />

                {/* Images */}
                {images?.length > 0 && (
                  <Box sx={{ display: 'flex', overflowX: 'auto', gap: 1, py: 1 }}>
                    {images.map((im) => (
                      <Box key={im.id || im.url}
                        sx={{
                          position: 'relative',
                          width: 120,
                          height: 120,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: im.is_primary ? 'primary.main' : 'divider',
                          flex: '0 0 auto',
                          bgcolor: 'grey.50',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(im.url, '_blank')}
                      >
                        <Box component="img" src={im.url}
                          alt={im.alt_text || 'image'}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
                        />
                        {im.is_primary && (
                          <Chip size="small" color="primary" label="Primary" sx={{ position: 'absolute', top: 6, left: 6 }} />
                        )}
                        {im.role && (
                          <Chip size="small" variant="light" label={im.role}
                            sx={{ position: 'absolute', bottom: 6, left: 6 }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                )}

                {images?.length > 0 && (
                  <Divider />
                )}

                {/* Variant ID + Product link */}
                <Stack spacing={2} >
                  <Field label="Variant ID" value={data?.id} />
                  <Field label="Product ID" value={data?.product_id} />
                  {data?.product?.name && (
                    <Button size="small" variant="text" onClick={() => router.push(`/products/${data.product.id || data.product_id}`)}>
                      View Product
                    </Button>
                  )}
                </Stack>

                {/* Pricing */}
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">Pricing</Typography>
                  <PriceBlock price_cents={data?.price_cents} mrp={data?.mrp} sale_price={data?.sale_price} currency={data?.currency} tax_inclusive={!!data?.tax_inclusive} />
                </Stack>

                {/* Inventory */}
                <Stack direction="row" spacing={2}>
                  {data?.barcode && <Field label="Barcode" value={data?.barcode} />}
                  {data?.gtin && <Field label="GTIN" value={data?.gtin} />}
                  {data?.mpn && <Field label="MPN" value={data?.mpn} />}
                </Stack>


                {/* Actions */}
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" onClick={() => router.push(`/variants/edit/${data?.id}`)}>Edit Variant</Button>
                </Stack>
              </>
            )}
          </Stack>

          {/* Right panel — Variant Attributes */}
          <Stack flex={9} spacing={2}>
            <ProductVarientAttrsView
              variant_id={id}
              variantName={data?.sku || ''}
              category_id={data?.product.category_id || null}
            />
          </Stack>
        </Stack>
      </MainCard>
    </>
  );
}
