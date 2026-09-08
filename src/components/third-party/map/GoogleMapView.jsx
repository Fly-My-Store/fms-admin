'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Typography } from '@mui/material';
import { GoogleMap, Marker, OverlayView, useJsApiLoader } from '@react-google-maps/api';
import { getGoogleMapsApiKey } from './googleMaps';

const FIT_PADDING = { top: 96, right: 80, bottom: 72, left: 80 };
const FOCUS_ZOOM = 17;
const SINGLE_ZOOM = 15;

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };

const PIN_COLORS = {
  store: '#0F766E',
  customer: '#1D4ED8',
  rider: '#E53935',
  default: '#1a1a1a'
};

function labelStyle(color) {
  return {
    padding: '3px 8px',
    borderRadius: 6,
    backgroundColor: color,
    color: '#fff',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.15,
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
    maxWidth: 148,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block',
    border: '2px solid #fff',
    boxShadow: '0 1px 0 rgba(15,23,42,0.08), 0 4px 10px rgba(15,23,42,0.38)',
    textShadow: '0 1px 1px rgba(0,0,0,0.35)'
  };
}

function MapMarkerLabel({ label, variant = 'default' }) {
  const color = PIN_COLORS[variant] || PIN_COLORS.default;
  return (
    <Box
      style={{
        ...labelStyle(color),
        transform: 'translate(-50%, calc(-100% - 40px))',
        pointerEvents: 'none'
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

function TeardropPin({ color, children }) {
  return (
    <Box sx={{ position: 'relative', width: 40, height: 48 }}>
      <Box
        component="svg"
        viewBox="0 0 48 50"
        sx={{ width: 40, height: 48, display: 'block', overflow: 'visible' }}
      >
        <ellipse cx="24" cy="48" rx="7" ry="2.2" fill="rgba(0,0,0,0.18)" />
        <path
          d="M24 2 C13 2 4 11 4 22 C4 34 24 48 24 48 C24 48 44 34 44 22 C44 11 35 2 24 2Z"
          fill={color}
        />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: 9,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 18,
          height: 18,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& svg': { width: 16, height: 16, display: 'block' }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

TeardropPin.propTypes = {
  color: PropTypes.string.isRequired,
  children: PropTypes.node
};

function StoreGlyph() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden>
      <path d="M200-800h560q17 0 28.5 11.5T800-760q0 17-11.5 28.5T760-720H200q-17 0-28.5-11.5T160-760q0-17 11.5-28.5T200-800Zm0 640q-17 0-28.5-11.5T160-200v-200h-7q-19 0-31-14.5t-8-33.5l40-200q3-14 14-23t25-9h574q14 0 25 9t14 23l40 200q4 19-8 33.5T807-400h-7v200q0 17-11.5 28.5T760-160q-17 0-28.5-11.5T720-200v-200H560v200q0 17-11.5 28.5T520-160H200Zm40-80h240v-160H240v160Z" />
    </svg>
  );
}

function HomeGlyph() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden>
      <path d="M240-200h120v-200q0-17 11.5-28.5T400-440h160q17 0 28.5 11.5T600-400v200h120v-360L480-740 240-560v360Zm-80 0v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H560q-17 0-28.5-11.5T520-160v-200h-80v200q0 17-11.5 28.5T400-120H240q-33 0-56.5-23.5T160-200Z" />
    </svg>
  );
}

function RiderBikeGlyph() {
  return (
    <Box component="svg" viewBox="0 0 64 46" sx={{ width: 44, height: 32, display: 'block', overflow: 'visible' }}>
      <ellipse cx="18" cy="34" rx="10" ry="10" fill="#1a1a1a" />
      <ellipse cx="18" cy="34" rx="5" ry="5" fill="#e8e8e8" />
      <ellipse cx="48" cy="34" rx="10" ry="10" fill="#1a1a1a" />
      <ellipse cx="48" cy="34" rx="5" ry="5" fill="#e8e8e8" />
      <path
        d="M22 30h20c2 0 4-1.5 5-3.5L50 18h-8l-3 6H28l-2-4h-8l2 6c1 2.5 2.5 4 4 4z"
        fill="#E53935"
      />
      <rect x="28" y="12" width="14" height="7" rx="2" fill="#E53935" />
      <path d="M42 15h8l2 4h-7z" fill="#222" />
      <circle cx="36" cy="10" r="5" fill="#222" />
      <circle cx="36" cy="10" r="2.5" fill="#f5c6a0" />
      <path d="M14 28h10v3H16z" fill="#333" />
    </Box>
  );
}

function PinLabel({ label, color }) {
  return (
    <Box component="span" style={{ ...labelStyle(color), marginTop: 4 }}>
      {label}
    </Box>
  );
}

PinLabel.propTypes = { label: PropTypes.string.isRequired, color: PropTypes.string.isRequired };

function MapPin({ label, kind = 'default' }) {
  const color = PIN_COLORS[kind] || PIN_COLORS.default;
  const isRider = kind === 'rider';

  return (
    <Box
      sx={{
        position: 'relative',
        transform: isRider ? 'translate(-50%, -70%)' : 'translate(-50%, -100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: isRider ? 3 : 1
      }}
    >
      {isRider ? (
        <RiderBikeGlyph />
      ) : (
        <TeardropPin color={color}>{kind === 'store' ? <StoreGlyph /> : <HomeGlyph />}</TeardropPin>
      )}
      <PinLabel label={label} color={color} />
    </Box>
  );
}

MapPin.propTypes = {
  label: PropTypes.string.isRequired,
  kind: PropTypes.string
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
  focusMarker = null
}) {
  const apiKey = getGoogleMapsApiKey();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'fms-admin-google-map',
    googleMapsApiKey: apiKey
  });
  const mapRef = useRef(null);

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
  const useCustomPins = !interactive && markers.some((m) => m.kind);
  const centerLat = mapCenter.lat;
  const centerLng = mapCenter.lng;
  const stableCenter = useMemo(() => ({ lat: centerLat, lng: centerLng }), [centerLat, centerLng]);
  const initialZoomRef = useRef(mapZoom);
  const mapOptions = useMemo(
    () => ({
      fullscreenControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      gestureHandling: 'cooperative',
      scrollwheel: false,
      clickableIcons: false,
      ...(interactive ? { draggableCursor: 'crosshair' } : {})
    }),
    [interactive]
  );

  const applyView = useCallback(
    (map = mapRef.current) => {
      if (!map || interactive || typeof window === 'undefined' || !window.google) return;

      if (focusMarker?.lat != null && focusMarker?.lng != null) {
        map.panTo({ lat: Number(focusMarker.lat), lng: Number(focusMarker.lng) });
        map.setZoom(FOCUS_ZOOM);
        return;
      }

      if (markers.length < 2) {
        if (markers.length === 1 && zoom == null) {
          map.panTo({ lat: Number(markers[0].lat), lng: Number(markers[0].lng) });
          map.setZoom(SINGLE_ZOOM);
        }
        return;
      }

      const bounds = new window.google.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend({ lat: Number(m.lat), lng: Number(m.lng) }));
      map.fitBounds(bounds, FIT_PADDING);
    },
    [focusMarker, interactive, markers, zoom]
  );

  const onMapLoad = useCallback(
    (map) => {
      mapRef.current = map;
      applyView(map);
      if (typeof window !== 'undefined' && window.google) {
        window.google.maps.event.addListenerOnce(map, 'idle', () => applyView(map));
      }
    },
    [applyView]
  );

  useEffect(() => {
    applyView();
  }, [applyView]);

  const handleMapClick = useCallback(
    (event) => {
      if (!interactive || !onPositionChange) return;
      onPositionChange(event.latLng.lat(), event.latLng.lng());
    },
    [interactive, onPositionChange]
  );

  const handleMarkerDragEnd = useCallback(
    (event) => {
      if (!interactive || !onPositionChange) return;
      onPositionChange(event.latLng.lat(), event.latLng.lng());
    },
    [interactive, onPositionChange]
  );

  if (!apiKey) {
    const coords = markers.length === 1 ? ` Coordinates: ${markers[0].lat}, ${markers[0].lng}` : '';
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
        center={stableCenter}
        zoom={interactive ? mapZoom : initialZoomRef.current}
        onLoad={onMapLoad}
        onClick={interactive ? handleMapClick : undefined}
        options={mapOptions}
      >
        {interactive && pickerPosition ? (
          <Marker position={pickerPosition} draggable onDragEnd={handleMarkerDragEnd} />
        ) : null}
        {!interactive && !useCustomPins
          ? markers.map((m) => (
              <Marker key={m.id} position={{ lat: Number(m.lat), lng: Number(m.lng) }} />
            ))
          : null}
        {!interactive && useCustomPins
          ? markers.map((m) => (
              <OverlayView
                key={`${m.id}-pin`}
                position={{ lat: Number(m.lat), lng: Number(m.lng) }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <MapPin label={m.label} kind={m.kind || 'default'} />
              </OverlayView>
            ))
          : null}
        {!interactive && !useCustomPins
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
          <OverlayView position={pickerPosition} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
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
      label: PropTypes.string.isRequired,
      kind: PropTypes.oneOf(['store', 'customer', 'rider', 'default'])
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
    lng: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }),
  onPositionChange: PropTypes.func,
  markerLabel: PropTypes.string,
  focusMarker: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  })
};
