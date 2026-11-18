'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Alert, Box, Chip, Link as MuiLink, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { getPrescriptionRequest } from 'api/prescriptionRequests';

const safe = (value) => (value === null || value === undefined || value === '' ? '—' : String(value));

const formatDate = (iso) => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const rupees = (cents) => `₹${(Number(cents || 0) / 100).toFixed(2)}`;

const shortId = (id) => (id ? String(id).slice(0, 8) : '—');

const isPdf = (url) => /\.pdf(\?|#|$)/i.test(String(url || ''));

const KV = ({ label, value, children }) => (
  <Stack direction="row" spacing={1.5} alignItems="baseline">
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
      {label}
    </Typography>
    {children || <Typography variant="body2">{safe(value)}</Typography>}
  </Stack>
);

function quoteState(quote) {
  if (quote?.accepted) return { label: 'Accepted', color: 'success' };
  if (quote?.draft) return { label: 'Draft', color: 'default' };
  if (quote?.submitted_at) return { label: 'Submitted', color: 'primary' };
  return { label: quote?.status || '—', color: 'default' };
}

function addressText(address) {
  if (!address) return '—';
  return [
    address.receiver_name,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code,
    address.formatted_address,
    address.phone
  ].filter(Boolean).join(', ');
}

export default function PrescriptionRequestDetailView() {
  const { id } = useParams();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const body = await getPrescriptionRequest(id);
      setRow(body?.data || null);
      if (!body?.data) setError('Prescription request not found.');
    } catch {
      setRow(null);
      setError('Could not load this prescription request.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const breadcrumb = useMemo(
    () => ({
      heading: 'prescription-request',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'prescription-requests', to: '/prescription-requests' },
        { title: shortId(id), i18n: false }
      ]
    }),
    [id]
  );

  const address = row?.address;

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      {loading ? <Alert severity="info">Loading prescription…</Alert> : null}
      {!loading && error ? <Alert severity="error">{error}</Alert> : null}
      {!loading && row ? (
        <Grid container spacing={2}>
          <Grid size={12}>
            <MainCard title="Request">
              <Stack spacing={1}>
                <KV label="Status" value={row.status} />
                <KV label="Customer" value={row.customer?.name} />
                <KV label="Phone" value={row.customer?.phone} />
                <KV label="Email" value={row.customer?.email} />
                <KV label="Expires" value={formatDate(row.expires_at)} />
                <KV label="Created" value={formatDate(row.created_at)} />
                <KV label="Note" value={row.note} />
                <KV label="Accepted cart" value={row.accepted_cart_id} />
                <KV label="Address" value={addressText(address)} />
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={12}>
            <MainCard title="Files">
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {(row.prescription_urls || []).map((url) => (
                  isPdf(url) ? (
                    <MuiLink key={url} href={url} target="_blank" rel="noreferrer">
                      {row.prescription_file_name || 'Open PDF'}
                    </MuiLink>
                  ) : (
                    <Box
                      key={url}
                      component="a"
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      sx={{ display: 'block' }}
                    >
                      <Box
                        component="img"
                        src={url}
                        alt={row.prescription_file_name || 'Prescription'}
                        sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1 }}
                      />
                    </Box>
                  )
                ))}
                {!row.prescription_urls?.length ? <Typography variant="body2">—</Typography> : null}
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={12}>
            <MainCard title="Notified pharmacies">
              <Stack spacing={0.75}>
                {(row.notified_stores || []).map((store) => (
                  <Typography key={store.store_id} variant="body2">
                    <Link href={`/stores/${store.store_id}`}>{store.store_name || store.store_id}</Link>
                    {store.distance_m != null ? ` · ${store.distance_m} m` : ''}
                    {store.store_type ? ` · ${store.store_type}` : ''}
                  </Typography>
                ))}
                {!row.notified_stores?.length ? <Typography variant="body2">None</Typography> : null}
              </Stack>
            </MainCard>
          </Grid>

          {(row.quotes || []).map((quote) => {
            const state = quoteState(quote);
            return (
              <Grid key={quote.cart_id} size={12}>
                <MainCard
                  title={quote.store_name || 'Pharmacy cart'}
                  secondary={<Chip size="small" color={state.color} label={state.label} />}
                >
                  <Stack spacing={0.75}>
                    <KV label="Cart" value={quote.cart_id} />
                    <KV label="Submitted" value={formatDate(quote.submitted_at)} />
                    <KV label="Distance" value={quote.distance_m == null ? '—' : `${quote.distance_m} m`} />
                    {(quote.items || []).map((item) => (
                      <Typography key={item.id || item.store_variant_id} variant="body2">
                        {item.qty} × {item.name}
                        {item.sku ? ` (${item.sku})` : ''}
                        {' · '}
                        {rupees(item.price_cents)}
                        {' · '}
                        {rupees(item.line_total_cents)}
                      </Typography>
                    ))}
                    <Typography variant="body2">Subtotal {rupees(quote.subtotal_cents)}</Typography>
                    {!quote.items?.length ? <Typography variant="body2">No items</Typography> : null}
                  </Stack>
                </MainCard>
              </Grid>
            );
          })}
        </Grid>
      ) : null}
    </>
  );
}
