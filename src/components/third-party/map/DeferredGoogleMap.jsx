'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Stack, Typography } from '@mui/material';
import GoogleMapView from './GoogleMapView';
import { recordMapsTelemetry } from 'api/audit';

export default function DeferredGoogleMap({
  buttonLabel = 'Load map',
  prompt = 'Load the interactive map when you need it.',
  ...mapProps
}) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) return <GoogleMapView {...mapProps} />;

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: mapProps.height || 240,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 1,
        bgcolor: 'grey.100',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack spacing={1.25} alignItems="center" sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {prompt}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setLoaded(true);
            recordMapsTelemetry({ service: 'DYNAMIC_MAPS', operation: 'map_mount', flow: 'admin_deferred_map', result: 'SUCCESS' }).catch(() => {});
          }}
        >
          {buttonLabel}
        </Button>
      </Stack>
    </Box>
  );
}

DeferredGoogleMap.propTypes = {
  buttonLabel: PropTypes.string,
  prompt: PropTypes.string,
  height: PropTypes.number
};
