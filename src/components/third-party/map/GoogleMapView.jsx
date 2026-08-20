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

export default function GoogleMapView({
  markers = [],
  height = 280,
  center,
  zoom,
  interactive = false,
  position = null,
  onPositionChange,
  markerLabel = 'Store',
}) {
  const apiKey = getGoogleMapsApiKey();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'fms-admin-google-map',
    googleMapsApiKey: apiKey
  });

  const pickerPosition = useMemo(() => {
    if (position?.lat != null && position?.lng != null) {
      const lat = Number(position.lat);
      const lng = Number(position.lng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
    return null;
  }, [position]);

  const mapCenter = useMemo(() => {
    if (interactive && pickerPosition) return pickerPosition;
    if (center?.lat != null && center?.lng != null) {
      return { lat: Number(center.lat), lng: Number(center.lng) };
    }
    if (markers.length) {
      return { lat: Number(markers[0].lat), lng: Number(markers[0].lng) };
    }
    return DEFAULT_CENTER;
  }, [center, interactive, markers, pickerPosition]);

  const mapZoom = zoom ?? (interactive ? (pickerPosition ? 15 : 5) : markers.length > 1 ? 12 : 14);

  const onMapLoad = useCallback(
    (map) => {
      if (interactive || markers.length < 2 || typeof window === 'undefined' || !window.google) return;
      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend({ lat: Number(m.lat), lng: Number(m.lng) }));
      map.fitBounds(bounds, 48);
    },
    [interactive, markers]
  );

  const handleMapClick = useCallback(
    (event) => {
      if (!interactive || !onPositionChange) return;
      onPositionChange(event.latLng.lat(), event.latLng.lng());
    },
    [interactive, onPositionChange],
  );

  const handleMarkerDragEnd = useCallback(
    (event) => {
      if (!interactive || !onPositionChange) return;
      onPositionChange(event.latLng.lat(), event.latLng.lng());
    },
    [interactive, onPositionChange],
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
        onClick={interactive ? handleMapClick : undefined}
        options={{
          fullscreenControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          ...(interactive ? { draggableCursor: 'crosshair' } : {}),
        }}
      >
        {interactive && pickerPosition ? (
          <Marker
            position={pickerPosition}
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        ) : null}
        {!interactive
          ? markers.map((m) => (
              <Marker key={m.id} position={{ lat: Number(m.lat), lng: Number(m.lng) }} />
            ))
          : null}
        {!interactive
          ? markers.map((m) => (
              <OverlayView
                key={`${m.id}-label`}
                position={{ lat: Number(m.lat), lng: Number(m.lng) }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <MapMarkerLabel label={m.label} variant={m.id === 'rider' ? 'rider' : 'default'} />
              </OverlayView>
            ))
          : null}
        {interactive && pickerPosition ? (
          <OverlayView
            position={pickerPosition}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <MapMarkerLabel label={markerLabel} />
          </OverlayView>
        ) : null}
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
  zoom: PropTypes.number,
  interactive: PropTypes.bool,
  position: PropTypes.shape({
    lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    lng: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  onPositionChange: PropTypes.func,
  markerLabel: PropTypes.string,
};
