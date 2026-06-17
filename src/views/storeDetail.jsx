'use client';

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import {
  Alert,
  Avatar,
  Chip,
  Stack,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import StoreLocationMap from 'sections/stores/StoreLocationMap';
import StoreOrdersCard from 'sections/stores/StoreOrdersCard';
import StoreVariantsGrid from 'sections/stores/StoreVariantsGrid';
import SellerPayoutsCard from 'sections/stores/SellerPayoutsCard';
import StoreSupportTicketsCard from 'sections/stores/StoreSupportTicketsCard';
import { actions as sellersStores } from 'store/sellersStores/slice';
import { RECORD_STATUS } from 'utils/constants';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const recordStatusLabel = (value) => {
  switch (Number(value)) {
    case RECORD_STATUS.ACTIVE:
      return 'Active';
    case RECORD_STATUS.INACTIVE:
      return 'Inactive';
    case RECORD_STATUS.ARCHIVED:
      return 'Archived';
    default:
      return safe(value);
  }
};

function RecordStatusChip({ value }) {
  const map = {
    1: { color: 'success', label: 'Active' },
    2: { color: 'warning', label: 'Inactive' },
    3: { color: 'default', label: 'Archived' }
  };
  const meta = map?.[value] ?? { color: 'default', label: safe(value) };
  return <Chip size="small" color={meta.color} label={meta.label} variant="light" />;
}

function KybChip({ value }) {
  const color =
    value === 'APPROVED' ? 'success' : value === 'REJECTED' ? 'error' : value === 'IN_REVIEW' ? 'warning' : 'default';
  return <Chip size="small" color={color} label={value ? `KYB: ${value}` : 'KYB: —'} variant="outlined" />;
}

const KV = ({ label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="baseline">
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
      {label}
    </Typography>
    <Typography variant="body2">{safe(value)}</Typography>
  </Stack>
);

export default function StoreDetailView() {
  const params = useParams();
  const dispatch = useDispatch();
  const id = params?.id;

  const { storeDetail } = useSelector((s) => s.sellersStores || {});
  const detail = storeDetail || { data: null, loading: false, error: null };
  const data = detail.data;

  const breadcrumb = useMemo(() => {
    const name = data?.name || id || 'store';
    return {
      heading: 'store',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'stores', to: '/stores' },
        { title: name, i18n: false }
      ]
    };
  }, [data?.name, id]);

  useEffect(() => {
    if (!id) return;
    dispatch(sellersStores.storesGetRequest({ params: { id } }));
  }, [dispatch, id]);

  const sellerId = data?.seller?.id;
  const sellerUserId = data?.seller?.user_id || data?.seller?.user?.id;
  const sellerName = data?.seller?.display_name || data?.seller?.legal_name;

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />

      {detail.loading && <Alert severity="info">Loading store…</Alert>}

      {!detail.loading && data && (
        <Grid container spacing={2}>
          <Grid size={12}>
            <MainCard border={false} boxShadow>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 48, height: 48 }}>{(data?.name || 'S').slice(0, 1).toUpperCase()}</Avatar>
                  <Stack spacing={0.5}>
                    <Typography variant="h5">{safe(data?.name)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {safe(data?.code)} · {safe(data?.slug)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                      {data.id}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                  <Chip
                    size="small"
                    variant="light"
                    color={data?.is_open ? 'success' : 'default'}
                    label={data?.is_open ? 'Open' : 'Closed'}
                  />
                  <Chip size="small" variant="light" label={safe(data?.status)} />
                  <KybChip value={data?.kyb_status} />
                  <RecordStatusChip value={data?.record_status} />
                </Stack>
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Store details">
              <Stack spacing={1}>
                <KV label="Phone" value={data?.phone} />
                <KV label="Email" value={data?.email} />
                <KV label="Support phone" value={data?.support_phone} />
                <KV label="Support email" value={data?.support_email} />
                <KV label="Hours" value={data?.open_time && data?.close_time ? `${data.open_time} – ${data.close_time}` : '—'} />
                <KV
                  label="Rating"
                  value={data?.rating != null ? `${data.rating} (${data.rating_count ?? 0})` : '—'}
                />
                <KV label="Delivery radius" value={data?.delivery_radius_m != null ? `${data.delivery_radius_m} m` : '—'} />
                <KV label="Updated" value={formatDate(data?.updated_at)} />
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Seller">
              {data?.seller ? (
                <Stack spacing={1}>
                  <KV label="Display name" value={data.seller.display_name} />
                  <KV label="Legal name" value={data.seller.legal_name} />
                  <KV label="GSTIN" value={data.seller.gstin} />
                  <KV label="PAN" value={data.seller.pan} />
                  <KV label="KYC status" value={data.seller.kyc_status} />
                  <KV label="KYB status" value={data.seller.kyb_status} />
                  <KV label="Owner" value={data.seller.user?.name} />
                  <KV label="Owner phone" value={data.seller.user?.phone} />
                  <KV label="Owner email" value={data.seller.user?.email} />
                </Stack>
              ) : (
                <Alert severity="info" variant="outlined">
                  No seller attached to this store.
                </Alert>
              )}
            </MainCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <StoreLocationMap store={data} />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <MainCard title="Verification & status">
              <Stack spacing={1}>
                <KV label="Store status" value={data?.status} />
                <KV label="Store KYB" value={data?.kyb_status} />
                <KV label="KYB reason" value={data?.kyb_reason} />
                <KV label="Record status" value={recordStatusLabel(data?.record_status)} />
                {data?.seller && (
                  <>
                    <KV label="Seller KYC" value={data.seller.kyc_status} />
                    <KV label="KYC reason" value={data.seller.kyc_reason} />
                    <KV label="Seller KYB" value={data.seller.kyb_status} />
                    <KV label="KYB reason" value={data.seller.kyb_reason} />
                  </>
                )}
              </Stack>
            </MainCard>
          </Grid>

          <Grid size={12}>
            <StoreOrdersCard storeId={id} />
          </Grid>

          <Grid size={12}>
            <StoreVariantsGrid storeId={id} />
          </Grid>

          {sellerId && (
            <Grid size={12}>
              <SellerPayoutsCard sellerId={sellerId} sellerName={sellerName} />
            </Grid>
          )}

          <Grid size={12}>
            <StoreSupportTicketsCard storeId={id} sellerUserId={sellerUserId} />
          </Grid>
        </Grid>
      )}

      {!detail.loading && !data && !detail.error && (
        <Alert severity="warning">Store not found.</Alert>
      )}
    </>
  );
}
