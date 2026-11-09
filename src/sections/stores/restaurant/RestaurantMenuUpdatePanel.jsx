'use client';

import { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { InboxOutlined } from '@ant-design/icons';
import { enqueueCsvJobWithFile } from 'api/csvJobs';
import {
  enqueueRestaurantMenuCsvUpdate,
  presignRestaurantMenuCsvJob
} from 'api/restaurantMenuCsv';

function isAllowedFile(file) {
  if (!file) return false;
  return String(file.name || '').toLowerCase().endsWith('.csv');
}

export default function RestaurantMenuUpdatePanel({ storeId, isDemo, isPetpooja, onQueued }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);
  const dragDepthRef = useRef(0);

  const onPick = (f) => {
    if (!isAllowedFile(f)) {
      enqueueSnackbar('Upload a .csv file', { variant: 'error' });
      return;
    }
    setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = 0;
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) onPick(f);
  }, []);

  const handleClear = () => {
    if (uploading) return;
    setFile(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!file || !storeId) {
      enqueueSnackbar('Choose a CSV first', { variant: 'warning' });
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      await enqueueCsvJobWithFile({
        file,
        presign: (body) =>
          presignRestaurantMenuCsvJob(storeId, { ...body, kind: 'RESTAURANT_MENU_UPDATE' }),
        enqueueJson: (body) => enqueueRestaurantMenuCsvUpdate(storeId, body),
        enqueueForm: (form, config) => enqueueRestaurantMenuCsvUpdate(storeId, form, config),
        onProgress: setProgress
      });
      enqueueSnackbar('Queued — you can close this page.', { variant: 'success' });
      onQueued?.();
      handleClear();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Could not queue update', {
        variant: 'error'
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  if (isDemo) {
    return <Alert severity="info">Menu CSV update is only available for live stores.</Alert>;
  }

  if (isPetpooja) {
    return (
      <Alert severity="warning">
        This store&apos;s menu is owned by Petpooja. Structure updates via CSV are blocked — use
        export to inspect, or sync from Petpooja.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Match rows by <strong>listing_id</strong> (store variant id). Updates price, packing, GST,
        stock, status, section, dish name, variant name, dietary, and description. Failed rows
        appear as an errors CSV on the jobs list.
      </Alert>

      <Box
        onDragEnter={(e) => {
          e.preventDefault();
          dragDepthRef.current += 1;
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
          if (dragDepthRef.current === 0) setDragActive(false);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        sx={{
          border: '1px dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          bgcolor: dragActive ? 'action.hover' : 'background.paper',
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          opacity: uploading ? 0.7 : 1
        }}
      >
        <InboxOutlined style={{ fontSize: 28, opacity: 0.6 }} />
        <Typography variant="body2" sx={{ mt: 1 }}>
          {file ? file.name : 'Drop menu update CSV here, or click to browse'}
        </Typography>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          disabled={uploading}
          onChange={(e) => onPick(e.target.files?.[0])}
        />
      </Box>

      {uploading && (
        <Box>
          <LinearProgress variant={progress ? 'determinate' : 'indeterminate'} value={progress} />
          <Typography variant="caption" color="text.secondary">
            {progress ? `Uploading ${progress}%` : 'Queuing…'}
          </Typography>
        </Box>
      )}

      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={handleClear} disabled={!file || uploading}>
          Clear
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!file || uploading}>
          Upload & update
        </Button>
      </Stack>
    </Stack>
  );
}

RestaurantMenuUpdatePanel.propTypes = {
  storeId: PropTypes.string,
  isDemo: PropTypes.bool,
  isPetpooja: PropTypes.bool,
  onQueued: PropTypes.func
};
