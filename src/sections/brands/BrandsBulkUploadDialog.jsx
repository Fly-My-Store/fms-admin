'use client';

import { useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { InboxOutlined } from '@ant-design/icons';
import { bulkImportBrands, downloadBrandsImportExample } from 'api/catalog';

const EXAMPLE_CSV = `name,slug,logo
Apple,apple,https://cdn.example.com/brands/apple.png
Samsung,samsung,images/samsung.png
Sony,sony,
`;

function isAllowedFile(file) {
  if (!file) return false;
  const name = String(file.name || '').toLowerCase();
  return name.endsWith('.csv') || name.endsWith('.zip');
}

function downloadText(filename, text, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function BrandsBulkUploadDialog({ open, onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const dragDepthRef = useRef(0);

  const reset = () => {
    setFile(null);
    setProgress(0);
    setResult(null);
    setUploading(false);
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose?.();
  };

  const onPick = (f) => {
    if (!isAllowedFile(f)) {
      enqueueSnackbar('Upload a .csv or .zip file', { variant: 'error' });
      return;
    }
    setFile(f);
    setResult(null);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = 0;
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) onPick(f);
  }, []);

  const handleExample = async () => {
    try {
      await downloadBrandsImportExample();
    } catch {
      downloadText('brands-import-example.csv', EXAMPLE_CSV);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      enqueueSnackbar('Choose a CSV or ZIP first', { variant: 'warning' });
      return;
    }
    setUploading(true);
    setProgress(0);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await bulkImportBrands(form, (evt) => {
        if (!evt.total) return;
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      const data = resp?.data || resp;
      setResult(data);
      const failed = data?.summary?.failed || 0;
      const created = data?.summary?.created || 0;
      enqueueSnackbar(
        failed
          ? `Import finished: ${created} created, ${failed} failed`
          : `Import OK — ${created} brand(s) created (inactive)`,
        { variant: failed ? 'warning' : 'success' }
      );
      onDone?.(data);
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Import failed', { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const downloadResult = () => {
    if (!result?.result_csv) return;
    downloadText('brands-import-result.csv', result.result_csv);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Bulk upload brands</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="info">
            CSV columns: <strong>name</strong>, <strong>slug</strong>, <strong>logo</strong>. Logo may be an
            https URL or a ZIP-relative path (e.g. <code>images/apple.png</code>). New brands are created as
            Inactive for approval.
          </Alert>

          <Button variant="outlined" size="small" onClick={handleExample} sx={{ alignSelf: 'flex-start' }}>
            Download example CSV
          </Button>

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
            onClick={() => inputRef.current?.click()}
            sx={{
              border: '1px dashed',
              borderColor: dragActive ? 'primary.main' : 'divider',
              bgcolor: dragActive ? 'action.hover' : 'background.paper',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <InboxOutlined style={{ fontSize: 28, opacity: 0.6 }} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {file ? file.name : 'Drop CSV/ZIP here, or click to browse'}
            </Typography>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.zip,text/csv,application/zip"
              hidden
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

          {result?.summary && (
            <Alert severity={(result.summary.failed || 0) > 0 ? 'warning' : 'success'}>
              Total {result.summary.total}: created {result.summary.created}, skipped {result.summary.skipped || 0},
              failed {result.summary.failed}
              {result.result_csv ? (
                <Button size="small" onClick={downloadResult} sx={{ ml: 1 }}>
                  Download result CSV
                </Button>
              ) : null}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Close
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!file || uploading}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

BrandsBulkUploadDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onDone: PropTypes.func
};
