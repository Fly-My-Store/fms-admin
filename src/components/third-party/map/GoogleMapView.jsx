'use client';

import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Typography } from '@mui/material';
import { GoogleMap, Marker, OverlayView, useJsApiLoader } from '@react-google-maps/api';
import { getGoogleMapsApiKey } from './googleMaps';

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

function MapMarkerLabel({ label, variant = 'default' }) {
  return (
    <Box
      sx={{
        bgcolor: variant === 'rider' ? 'primary.main' : 'grey.700',
        color: 'common.white',
        px: 1,
        py: 0.5,
        borderRadius: 1,
        fontSize: 11,
        fontWeight: 600,
        transform: 'translate(-50%, -100%)',
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </Box>
  );
}

MapMarkerLabel.propTypes = {
  label: PropTypes.string.isRequired,
  variant: PropTypes.string
};

export default function GoogleMapView({ markers = [], height = 280, center, zoom }) {
  const apiKey = getGoogleMapsApiKey();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'fms-admin-google-map',
    googleMapsApiKey: apiKey
  });

  const mapCenter = useMemo(() => {
    if (center?.lat != null && center?.lng != null) {
      return { lat: Number(center.lat), lng: Number(center.lng) };
    }
    if (markers.length) {
      return { lat: Number(markers[0].lat), lng: Number(markers[0].lng) };
    }
    return DEFAULT_CENTER;
  }, [center, markers]);

  const mapZoom = zoom ?? (markers.length > 1 ? 12 : 14);

  const onMapLoad = useCallback(
    (map) => {
      if (markers.length < 2 || typeof window === 'undefined' || !window.google) return;
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend({ lat: Number(m.lat), lng: Number(m.lng) }));
      map.fitBounds(bounds, 48);
    },
    [markers]
  );

  if (!apiKey) {
    const coords =
      markers.length === 1 ? ` Coordinates: ${markers[0].lat}, ${markers[0].lng}` : '';
    return (
      <Alert severity="warning">
        Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show the map.{coords}
      </Alert>
    );
  }

  if (loadError) {
    return <Alert severity="error">Failed to load Google Maps.</Alert>;
  }

  if (!isLoaded) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading map…
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%', height, borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.200' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={mapZoom}
        onLoad={onMapLoad}
        options={{ fullscreenControl: true, mapTypeControl: false, streetViewControl: false }}
      >
        {markers.map((m) => (
          <Marker key={m.id} position={{ lat: Number(m.lat), lng: Number(m.lng) }} />
        ))}
        {markers.map((m) => (
          <OverlayView
            key={`${m.id}-label`}
            position={{ lat: Number(m.lat), lng: Number(m.lng) }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <MapMarkerLabel label={m.label} variant={m.id === 'rider' ? 'rider' : 'default'} />
          </OverlayView>
        ))}
      </GoogleMap>
    </Box>
  );
}

GoogleMapView.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired
    })
  ),
  height: PropTypes.number,
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  zoom: PropTypes.number
};
