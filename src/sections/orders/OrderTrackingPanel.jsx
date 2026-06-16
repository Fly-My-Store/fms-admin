'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Stack, Typography } from '@mui/material';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import MainCard from 'components/MainCard';
import MapControl from 'components/third-party/map/MapControl';
import MapContainerStyled from 'components/third-party/map/MapContainerStyled';
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
      pts.push({ id: 'store', lat: store.lat, lng: store.lng, label: 'Store' });
    }
    const addr = tracking.delivery_address;
    if (addr?.lat != null && addr?.lng != null) {
      pts.push({ id: 'customer', lat: Number(addr.lat), lng: Number(addr.lng), label: 'Customer' });
    }
    const rider = tracking.rider_location;
    if (rider?.lat != null && rider?.lng != null) {
      pts.push({ id: 'rider', lat: rider.lat, lng: rider.lng, label: 'Rider' });
    }
    return pts;
  }, [tracking]);

  const mapToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const center = markers[0] || { lat: 20.5937, lng: 78.9629 };

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

            {mapToken && markers.length > 0 ? (
              <MapContainerStyled>
                <Map
                  mapboxAccessToken={mapToken}
                  initialViewState={{ longitude: center.lng, latitude: center.lat, zoom: 12 }}
                  style={{ width: '100%', height: 320 }}
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                >
                  <MapControl />
                  {markers.map((m) => (
                    <Marker key={m.id} longitude={m.lng} latitude={m.lat} anchor="bottom">
                      <Box
                        sx={{
                          bgcolor: m.id === 'rider' ? 'primary.main' : 'grey.700',
                          color: 'common.white',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: 11,
                          fontWeight: 600
                        }}
                      >
                        {m.label}
                      </Box>
                    </Marker>
                  ))}
                </Map>
              </MapContainerStyled>
            ) : (
              !mapToken && (
                <Alert severity="warning">
                  Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to enable the tracking map. Milestone data is still shown above.
                </Alert>
              )
            )}
          </>
        )}
      </Stack>
    </MainCard>
  );
}
