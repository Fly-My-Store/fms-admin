'use client';

import PropTypes from 'prop-types';
import { Stack, TextField, Typography } from '@mui/material';
import GoogleMapView from 'components/third-party/map/GoogleMapView';

export default function StoreLocationPicker({
  address,
  lat,
  lng,
  deliveryRadiusM,
  errors = {},
  onAddressChange,
  onLatChange,
  onLngChange,
  onDeliveryRadiusChange,
  storeName,
}) {
  const latNum = lat === '' || lat == null ? null : Number(lat);
  const lngNum = lng === '' || lng == null ? null : Number(lng);
  const hasCoords = latNum != null && lngNum != null && Number.isFinite(latNum) && Number.isFinite(lngNum);

  const handlePick = (nextLat, nextLng) => {
    onLatChange?.(String(Number(nextLat.toFixed(6))));
    onLngChange?.(String(Number(nextLng.toFixed(6))));
  };

  return (
    <Stack spacing={2}>
      <TextField
        size="small"
        label="Address"
        required
        fullWidth
        multiline
        minRows={2}
        value={address || ''}
        onChange={(e) => onAddressChange?.(e.target.value)}
        error={!!errors.address_text}
        helperText={errors.address_text || 'Full store address shown to customers'}
      />

      <Stack spacing={0.5}>
        <Typography variant="body2" color="text.secondary">
          Click the map or drag the pin to set store location
        </Typography>
        <GoogleMapView
          interactive
          height={240}
          position={hasCoords ? { lat: latNum, lng: lngNum } : null}
          onPositionChange={handlePick}
          markerLabel={storeName || 'Store'}
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          size="small"
          label="Latitude"
          required
          fullWidth
          type="number"
          value={lat ?? ''}
          onChange={(e) => onLatChange?.(e.target.value)}
          error={!!errors.lat}
          helperText={errors.lat || ''}
        />
        <TextField
          size="small"
          label="Longitude"
          required
          fullWidth
          type="number"
          value={lng ?? ''}
          onChange={(e) => onLngChange?.(e.target.value)}
          error={!!errors.lng}
          helperText={errors.lng || ''}
        />
        <TextField
          size="small"
          label="Delivery radius (m)"
          fullWidth
          type="number"
          value={deliveryRadiusM ?? ''}
          onChange={(e) => onDeliveryRadiusChange?.(e.target.value)}
          error={!!errors.delivery_radius_m}
          helperText={errors.delivery_radius_m || 'Default 5000 m'}
        />
      </Stack>
    </Stack>
  );
}

StoreLocationPicker.propTypes = {
  address: PropTypes.string,
  lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  lng: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  deliveryRadiusM: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  errors: PropTypes.object,
  onAddressChange: PropTypes.func,
  onLatChange: PropTypes.func,
  onLngChange: PropTypes.func,
  onDeliveryRadiusChange: PropTypes.func,
  storeName: PropTypes.string,
};
