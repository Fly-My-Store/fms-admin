'use client';

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Alert, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import GoogleMapView from 'components/third-party/map/GoogleMapView';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

export default function StoreLocationMap({ store }) {
  const lat = store?.lat != null ? Number(store.lat) : null;
  const lng = store?.lng != null ? Number(store.lng) : null;
  const hasCoords = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng);

  const markers = useMemo(() => {
    if (!hasCoords) return [];
    return [{ id: 'store', lat, lng, label: store?.name || 'Store' }];
  }, [hasCoords, lat, lng, store?.name]);

  const mapsUrl = useMemo(() => {
    if (hasCoords) return `https://www.google.com/maps?q=${lat},${lng}`;
    if (store?.address_text) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address_text)}`;
    }
    return null;
  }, [hasCoords, lat, lng, store?.address_text]);

  return (
    <MainCard title="Store location">
      <Stack spacing={2}>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {safe(store?.address_text)}
        </Typography>
        {store?.delivery_radius_m != null && (
          <Typography variant="body2" color="text.secondary">
            Delivery radius: {store.delivery_radius_m} m
          </Typography>
        )}
        {!hasCoords && (
          <Alert severity="info">No coordinates on file for this store. Address shown above.</Alert>
        )}
        {hasCoords && <GoogleMapView markers={markers} height={280} zoom={14} />}
        {mapsUrl && (
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
        )}
      </Stack>
    </MainCard>
  );
}

StoreLocationMap.propTypes = {
  store: PropTypes.object
};
