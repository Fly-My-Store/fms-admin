'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import GoogleMapView from 'components/third-party/map/GoogleMapView';
import { listRiderLocations } from 'api/logistics';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

export default function RiderLocationMap({ riderId }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLocation = useCallback(async () => {
    if (!riderId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await listRiderLocations(riderId, { page: 1, limit: 1 });
      const row = resp?.data?.[0] || null;
      setLocation(row);
      if (row && row.lat == null && row.latitude == null) {
        setError('No location reported yet for this rider.');
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load rider location');
      setLocation(null);
    } finally {
      setLoading(false);
    }
  }, [riderId]);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  const lat = location?.lat ?? location?.latitude;
  const lng = location?.lng ?? location?.longitude;
  const hasCoords = lat != null && lng != null;

  const markers = useMemo(() => {
    if (!hasCoords) return [];
    return [{ id: 'rider', lat: Number(lat), lng: Number(lng), label: 'Rider' }];
  }, [hasCoords, lat, lng]);

  return (
    <MainCard
      title="Current location"
      secondary={
        <Button variant="outlined" size="small" onClick={loadLocation} disabled={loading || !riderId}>
          {loading ? 'Loading…' : 'Refresh'}
        </Button>
      }
    >
      <Stack spacing={2}>
        {loading && !location && (
          <Typography variant="body2" color="text.secondary">
            Loading latest GPS position…
          </Typography>
        )}
        {error && <Alert severity="info">{error}</Alert>}
        {location && hasCoords && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Typography variant="body2">Last reported: {formatDate(location.last_reported_at || location.updated_at)}</Typography>
            {location.accuracy_m != null && (
              <Typography variant="body2" color="text.secondary">
                Accuracy: {location.accuracy_m} m
              </Typography>
            )}
          </Stack>
        )}
        {hasCoords ? <GoogleMapView markers={markers} height={280} zoom={14} /> : null}
      </Stack>
    </MainCard>
  );
}

RiderLocationMap.propTypes = {
  riderId: PropTypes.string
};
