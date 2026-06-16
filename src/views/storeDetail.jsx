'use client';

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';

import {
  Alert,
  Avatar,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useParams } from 'next/navigation';
import { actions as sellersStores } from 'store/sellersStores/slice';

// ========= helpers =========
const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const RecordStatusChip = ({ value }) => {
  const map = {
    1: { color: 'success', label: 'Active' },
    2: { color: 'warning', label: 'Inactive' },
    3: { color: 'default', label: 'Archived' }
  };
  const meta = map?.[value] ?? { color: 'default', label: safe(value) };
  return <Chip size="small" color={meta.color} label={meta.label} variant="light" />;
};

const KV = ({ label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="baseline">
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
      {label}
    </Typography>
    <Typography variant="body2">{safe(value)}</Typography>
  </Stack>
);

// ========= page =========
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

  const mapsUrl = useMemo(() => {
    if (data?.lat != null && data?.lng != null) {
      return `https://www.google.com/maps?q=${data.lat},${data.lng}`;
    }
    if (data?.address_text) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address_text)}`;
    }
    return null;
  }, [data]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard border={false} boxShadow>
        <Stack flex={3} spacing={2}>
          {detail.loading && <Alert severity="info">Loading…</Alert>}
          {!detail.loading && data && (
            <>
              {/* Header */}
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar>{(data?.name || 'S').slice(0, 1).toUpperCase()}</Avatar>
                  <Stack spacing={0.25}>
                    <Typography variant="h5">{safe(data?.name)}</Typography>
                    <Typography variant="caption" color="text.secondary">{safe(data?.slug)}</Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip size="small" variant="light" color={data?.is_open ? 'success' : 'default'} label={data?.is_open ? 'Open' : 'Closed'} />
                  <Chip size="small" variant="light" label={safe(data?.status)} />
                  <Chip size="small" variant="light" label={`Store KYB: ${safe(data?.kyb_status)}`} />
                  <RecordStatusChip value={data?.record_status} />
                </Stack>
              </Stack>

              <Divider />

              {/* Store details */}
              <Typography variant="overline">Store details</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Stack spacing={1.25} flex={1}>
                  <KV label="Code" value={data?.code} />
                  <KV label="Phone" value={data?.phone} />
                  <KV label="Email" value={data?.email} />
                  <KV label="Support Phone" value={data?.support_phone} />
                  <KV label="Support Email" value={data?.support_email} />
                  <KV label="Open Time" value={data?.open_time} />
                  <KV label="Close Time" value={data?.close_time} />
                </Stack>
                <Stack spacing={1.25} flex={1}>
                  <KV label="Status" value={data?.status} />
                  <KV label="Store KYB Status" value={data?.kyb_status} />
                  <KV label="Store KYB Reason" value={data?.kyb_reason} />
                  <KV label="Delivery Radius (m)" value={data?.delivery_radius_m} />
                  <KV label="Rating" value={data?.rating != null ? `${data?.rating} (${data?.rating_count ?? 0})` : '—'} />
                  <KV label="Latitude" value={data?.lat} />
                  <KV label="Longitude" value={data?.lng} />
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">Address</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{safe(data?.address_text)}</Typography>
                    {mapsUrl ? (
                      <Typography
                        component="a"
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        color="primary"
                      >
                        Open in Google Maps
                      </Typography>
                    ) : null}
                  </Stack>
                </Stack>
              </Stack>

              <Divider />

              {/* Seller details */}
              <Typography variant="overline">Seller</Typography>
              {data?.seller ? (
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <Stack spacing={1.25} flex={1}>
                    <KV label="Display Name" value={data?.seller?.display_name} />
                    <KV label="Legal Name" value={data?.seller?.legal_name} />
                    <KV label="KYC Status" value={data?.seller?.kyc_status} />
                    <KV label="KYC Reason" value={data?.seller?.kyc_reason} />
                    <KV label="KYB Status" value={data?.seller?.kyb_status} />
                    <KV label="KYB Reason" value={data?.seller?.kyb_reason} />
                    <KV label="Onboarding Step" value={data?.seller?.onboarding_step} />
                  </Stack>
                  <Stack spacing={1.25} flex={1}>
                    <KV label="GSTIN" value={data?.seller?.gstin} />
                    <KV label="PAN" value={data?.seller?.pan} />
                    <KV label="CIN" value={data?.seller?.cin} />
                    <KV label="Support Email" value={data?.seller?.support_email} />
                    <KV label="Support Phone" value={data?.seller?.support_phone} />
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="info" variant="outlined">No seller attached to this store.</Alert>
              )}

              <Divider />

              {/* Seller's user (owner) */}
              <Typography variant="overline">Seller Owner</Typography>
              {data?.seller?.user ? (
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <Stack spacing={1.25} flex={1}>
                    <KV label="Name" value={data?.seller?.user?.name} />
                    <KV label="Email" value={data?.seller?.user?.email} />
                    <KV label="Phone" value={data?.seller?.user?.phone} />
                  </Stack>
                  <Stack spacing={1.25} flex={1}>
                    <KV label="Type" value={data?.seller?.user?.type} />
                    <KV label="Status" value={data?.seller?.user?.status} />
                  </Stack>
                </Stack>
              ) : (
                <Alert severity="info" variant="outlined">No user information found for seller.</Alert>
              )}
            </>
          )}
        </Stack>

      </MainCard>
    </>
  );
}
