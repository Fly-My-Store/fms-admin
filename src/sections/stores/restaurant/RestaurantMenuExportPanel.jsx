'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { enqueueRestaurantMenuCsvExport } from 'api/restaurantMenuCsv';

export default function RestaurantMenuExportPanel({ storeId, isDemo, onQueued }) {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (!storeId || busy) return;
    setBusy(true);
    try {
      await enqueueRestaurantMenuCsvExport(storeId);
      enqueueSnackbar('Menu export queued — download from jobs below.', { variant: 'success' });
      onQueued?.();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Could not queue export', {
        variant: 'error'
      });
    } finally {
      setBusy(false);
    }
  };

  if (isDemo) {
    return <Alert severity="info">Menu CSV export is only available for live stores.</Alert>;
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="body2" color="text.secondary">
        One row per dish variant. Columns: listing_id, section, dish_name, variant_name, dietary,
        price_rupee, packing_rupee, gst_percent, description, stock_status, record_status.
      </Typography>
      <Button variant="contained" onClick={handleExport} disabled={busy} sx={{ alignSelf: 'flex-start' }}>
        {busy ? 'Queuing…' : 'Export menu CSV'}
      </Button>
    </Stack>
  );
}

RestaurantMenuExportPanel.propTypes = {
  storeId: PropTypes.string,
  isDemo: PropTypes.bool,
  onQueued: PropTypes.func
};
