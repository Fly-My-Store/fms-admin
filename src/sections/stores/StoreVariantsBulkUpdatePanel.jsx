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
import { bulkUpdateStoreVariants } from 'api/listingsInventory';

function isAllowedFile(file) {
  if (!file) return false;
  return String(file.name || '').toLowerCase().endsWith('.csv');
}

export default function StoreVariantsBulkUpdatePanel({ storeId, isDemo, onDone }) {
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
      const form = new FormData();
      form.append('file', file);
      const resp = await bulkUpdateStoreVariants(storeId, form, (evt) => {
        if (!evt.total) return;
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      const data = resp?.data || resp;
      const failed = data?.summary?.failed || 0;
      const updated = data?.summary?.updated || 0;
      enqueueSnackbar(
        failed ? `Update finished: ${updated} updated, ${failed} failed` : `Update OK — ${updated} listing(s) changed`,
        { variant: failed ? 'warning' : 'success' }
      );
      onDone?.(data);
      handleClear();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Update failed', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  if (isDemo) {
    return <Alert severity="info">Bulk listing update is only available for live stores.</Alert>;
  }

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Re-upload the downloaded CSV. Only <strong>price_rupee</strong>, <strong>mrp_rupee</strong>,{' '}
        <strong>max_per_order</strong>, <strong>stock_status</strong> (in / out), and <strong>max_order_qty</strong> are
        updated. Match is by <strong>id</strong>. Max 100 rows.
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
          {file ? file.name : 'Drop update CSV here, or click to browse'}
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
            {progress ? `Uploading ${progress}%` : 'Processing…'}
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

StoreVariantsBulkUpdatePanel.propTypes = {
  storeId: PropTypes.string,
  isDemo: PropTypes.bool,
  onDone: PropTypes.func
};
