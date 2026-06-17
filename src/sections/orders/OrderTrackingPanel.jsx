'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import GoogleMapView from 'components/third-party/map/GoogleMapView';
import { getOrderTracking } from 'api/ordersPayments';

const ACTIVE_DELIVERY = ['ASSIGNED', 'REACHED_STORE', 'PICKED_UP'];

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const formatEta = (seconds) => {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s <= 0) return '—';
  const mins = Math.round(s / 60);
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

export default function OrderTrackingPanel({ orderId, deliveryStatus }) {
  const [tracking, setTracking] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const showPanel = ACTIVE_DELIVERY.includes(deliveryStatus);

  const loadTracking = useCallback(async () => {
    if (!orderId || !showPanel) return;
    setLoading(true);
    try {
      const resp = await getOrderTracking(orderId);
      setTracking(resp?.data || resp);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load tracking');
    } finally {
      setLoading(false);
    }
  }, [orderId, showPanel]);

  useEffect(() => {
    loadTracking();
    if (!showPanel) return undefined;
    const id = setInterval(loadTracking, 20000);
    return () => clearInterval(id);
  }, [loadTracking, showPanel]);

  const markers = useMemo(() => {
    if (!tracking) return [];
    const pts = [];
    const store = tracking.store;
    if (store?.lat != null && store?.lng != null) {
      pts.push({ id: 'store', lat: Number(store.lat), lng: Number(store.lng), label: 'Store' });
    }
    const addr = tracking.delivery_address;
    if (addr?.lat != null && addr?.lng != null) {
      pts.push({ id: 'customer', lat: Number(addr.lat), lng: Number(addr.lng), label: 'Customer' });
    }
    const rider = tracking.rider_location;
    if (rider?.lat != null && rider?.lng != null) {
      pts.push({ id: 'rider', lat: Number(rider.lat), lng: Number(rider.lng), label: 'Rider' });
    }
    return pts;
  }, [tracking]);

  if (!showPanel) return null;

  return (
    <MainCard title="Live tracking">
      <Stack spacing={2}>
        {loading && !tracking && <Alert severity="info">Loading tracking…</Alert>}
        {error && <Alert severity="warning">{error}</Alert>}

        {tracking && (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Typography variant="body2">
                Rider last seen: {formatDate(tracking.rider_location?.last_reported_at)}
              </Typography>
              <Typography variant="body2">
                ETA: {formatEta(tracking.delivery?.eta_seconds ?? tracking.computed_eta_seconds)}
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Typography variant="caption" color="text.secondary">
                Started: {formatDate(tracking.delivery?.started_at)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Picked up: {formatDate(tracking.delivery?.picked_up_at)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Delivered: {formatDate(tracking.delivery?.delivered_at)}
              </Typography>
            </Stack>

            {!tracking.rider_location?.lat && (
              <Alert severity="info">Waiting for rider GPS update.</Alert>
            )}

            {markers.length > 0 ? <GoogleMapView markers={markers} height={320} /> : null}
          </>
        )}
      </Stack>
    </MainCard>
  );
}
