'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, ButtonBase, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import EntityLink from 'components/EntityLink';
import GoogleMapView from 'components/third-party/map/GoogleMapView';
import { getOrderTracking } from 'api/ordersPayments';
import { getOrderCustomerHref, getOrderRiderHref, getOrderStoreHref } from 'utils/orderLinks';

const LIVE_DELIVERY = ['ASSIGNED', 'STARTED', 'REACHED_STORE', 'PICKED_UP'];

const LEGEND = [
  { id: 'store', color: '#0F766E', label: 'Store' },
  { id: 'customer', color: '#1D4ED8', label: 'Customer' },
  { id: 'rider', color: '#E53935', label: 'Rider', bike: true }
];

function toCoord(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function coordsFrom(obj) {
  if (!obj) return null;
  const lat = toCoord(obj.lat ?? obj.latitude);
  const lng = toCoord(obj.lng ?? obj.longitude);
  if (lat != null && lng != null) return { lat, lng };
  const pair = obj.geom?.coordinates;
  if (Array.isArray(pair) && pair.length >= 2) {
    const parsedLng = toCoord(pair[0]);
    const parsedLat = toCoord(pair[1]);
    if (parsedLat != null && parsedLng != null) return { lat: parsedLat, lng: parsedLng };
  }
  return null;
}

function point(id, kind, label, source) {
  const coord = coordsFrom(source);
  if (!coord) return null;
  return { id, kind, label, lat: coord.lat, lng: coord.lng };
}

function LegendButton({ item, marker, selected, onSelect }) {
  const enabled = Boolean(marker);
  return (
    <ButtonBase
      disabled={!enabled}
      onClick={() => onSelect(item.id)}
      aria-pressed={selected}
      aria-label={enabled ? `Zoom to ${item.label}` : `${item.label} location unavailable`}
      sx={{
        borderRadius: 1,
        px: 1,
        py: 0.5,
        gap: 0.75,
        display: 'inline-flex',
        alignItems: 'center',
        opacity: enabled ? 1 : 0.4,
        bgcolor: selected ? 'grey.100' : 'transparent',
        outline: selected ? '2px solid' : '1px solid transparent',
        outlineColor: selected ? item.color : 'transparent',
        cursor: enabled ? 'pointer' : 'default'
      }}
    >
      {item.bike ? (
        <Box
          sx={{
            width: 22,
            height: 14,
            borderRadius: 0.5,
            bgcolor: item.color,
            boxShadow: '0 0 0 1px rgba(15,23,42,0.12)'
          }}
        />
      ) : (
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: item.color,
            border: '2px solid #fff',
            boxShadow: '0 0 0 1px rgba(15,23,42,0.12)'
          }}
        />
      )}
      <Typography variant="caption" color={enabled ? 'text.primary' : 'text.secondary'} fontWeight={selected ? 700 : 500}>
        {item.label}
      </Typography>
    </ButtonBase>
  );
}

LegendButton.propTypes = {
  item: PropTypes.object.isRequired,
  marker: PropTypes.object,
  selected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired
};

export default function OrderTrackingPanel({ order }) {
  const orderId = order?.id;
  const deliveryStatus = String(order?.delivery?.status || '').toUpperCase();
  const live = LIVE_DELIVERY.includes(deliveryStatus);

  const [tracking, setTracking] = useState(null);
  const [focusId, setFocusId] = useState(null);

  const loadTracking = useCallback(async () => {
    if (!orderId) return;
    try {
      const resp = await getOrderTracking(orderId);
      setTracking(resp?.data || resp);
    } catch {
      setTracking(null);
    }
  }, [orderId]);

  useEffect(() => {
    loadTracking();
    if (!live) return undefined;
    const id = setInterval(loadTracking, 20000);
    return () => clearInterval(id);
  }, [loadTracking, live]);

  const markers = useMemo(() => {
    const addr = tracking?.delivery_address || order?.delivery_address;
    const drop = order?.delivery;
    const customerSource = {
      lat: addr?.lat ?? drop?.drop_lat,
      lng: addr?.lng ?? drop?.drop_lng
    };
    const storeSource = {
      lat: tracking?.store?.lat ?? order?.store?.lat,
      lng: tracking?.store?.lng ?? order?.store?.lng,
      geom: tracking?.store?.geom || order?.store?.geom
    };

    return [
      point('store', 'store', order?.store?.name || 'Store', storeSource),
      point('customer', 'customer', order?.customer?.name || 'Customer', customerSource),
      live
        ? point(
          'rider',
          'rider',
          order?.delivery?.rider?.name || tracking?.delivery?.rider?.name || 'Rider',
          tracking?.rider_location
        )
        : null
    ].filter(Boolean);
  }, [order, tracking, live]);

  useEffect(() => {
    if (focusId && !markers.some((m) => m.id === focusId)) setFocusId(null);
  }, [focusId, markers]);

  const markerById = useMemo(() => Object.fromEntries(markers.map((m) => [m.id, m])), [markers]);
  const focusMarker = focusId ? markerById[focusId] || null : null;

  const handleLegendSelect = (id) => {
    setFocusId((current) => (current === id ? null : id));
  };

  if (!orderId) return null;

  return (
    <MainCard
      title="Locations"
      secondary={
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap alignItems="center">
          <ButtonBase
            onClick={() => setFocusId(null)}
            disabled={!markers.length}
            aria-pressed={!focusId}
            aria-label="Show all locations"
            sx={{
              borderRadius: 1,
              px: 1,
              py: 0.5,
              bgcolor: !focusId ? 'grey.100' : 'transparent',
              outline: !focusId ? '2px solid' : '1px solid transparent',
              outlineColor: !focusId ? 'grey.400' : 'transparent'
            }}
          >
            <Typography variant="caption" fontWeight={!focusId ? 700 : 500}>
              All
            </Typography>
          </ButtonBase>
          {LEGEND.map((item) => (
            <LegendButton
              key={item.id}
              item={item}
              marker={markerById[item.id]}
              selected={focusId === item.id}
              onSelect={handleLegendSelect}
            />
          ))}
        </Stack>
      }
    >
      <Stack spacing={1.5}>
        {markers.length ? (
          <Box sx={{ maxWidth: '100%' }}>
            <GoogleMapView markers={markers} height={280} focusMarker={focusMarker} />
          </Box>
        ) : (
          <Alert severity="info">No map coordinates on this order yet.</Alert>
        )}

        {live && !coordsFrom(tracking?.rider_location) ? (
          <Typography variant="caption" color="text.secondary">
            Waiting for rider GPS.
          </Typography>
        ) : null}
      </Stack>
    </MainCard>
  );
}

OrderTrackingPanel.propTypes = {
  order: PropTypes.object
};
