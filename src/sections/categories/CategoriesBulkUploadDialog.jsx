'use client';

import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import { InboxOutlined } from '@ant-design/icons';
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
import { bulkImportCategories, downloadCategoriesImportExample } from 'api/catalog';

const EXAMPLE_CSV = `name,slug,description,logo,prescription_required,is_featured,parent_name,parent_slug,parent_description,parent_logo,parent_prescription_required,parent_is_featured
Accessories,,Accessories and wearable devices,images/accessories.png,none,true,,,,,,
Neckband,,Wireless neckband earphones,images/neckband.png,none,false,Accessories,,Accessories and wearable devices,images/accessories.png,none,true
Medicines,,OTC and Rx medicines,,required,false,Pharmacy,,,,optional,true
Smart Watches,smart-watches,Wearable smart watches,https://cdn.example.com/categories/watches.png,none,false,Accessories,,Accessories and wearable devices,images/accessories.png,none,true
`;

function isAllowedFile(file) {
  const name = String(file?.name || '').toLowerCase();
  return name.endsWith('.csv') || name.endsWith('.zip');
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function CategoriesBulkUploadDialog({ open, onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const dragDepthRef = useRef(0);

  const reset = () => {
    setFile(null);
    setDragActive(false);
    setUploading(false);
    setProgress(0);
    setResult(null);
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose?.();
  };

  const selectFile = (nextFile) => {
    if (!isAllowedFile(nextFile)) {
      enqueueSnackbar('Upload a .csv or .zip file', { variant: 'error' });
      return;
    }
    setFile(nextFile);
    setResult(null);
  };

  const handleExample = async () => {
    try {
      await downloadCategoriesImportExample();
    } catch {
      downloadText('categories-import-example.csv', EXAMPLE_CSV);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await bulkImportCategories(formData, (event) => {
        if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
      });
      const data = response?.data || response;
      setResult(data);
      const created = data?.summary?.created || 0;
      const failed = data?.summary?.failed || 0;
      enqueueSnackbar(
        failed
          ? `Import finished: ${created} created, ${failed} failed`
          : `Import OK — ${created} category(s) created`,
        { variant: failed ? 'warning' : 'success' }
      );
      onDone?.(data);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || error?.message || 'Import failed', {
        variant: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Bulk upload categories</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="info">
            Required: <strong>name</strong>. Optional: slug, description, logo, parent_name,
            parent_slug, parent_description, parent_logo. Empty slugs are generated automatically.
            Logos may be https URLs or ZIP-relative paths. New rows are created Inactive.
          </Alert>

          <Button variant="outlined" size="small" onClick={handleExample} sx={{ alignSelf: 'flex-start' }}>
            Download example CSV
          </Button>

          <Box
            onDragEnter={(event) => {
              event.preventDefault();
              dragDepthRef.current += 1;
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
              if (dragDepthRef.current === 0) setDragActive(false);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              dragDepthRef.current = 0;
              setDragActive(false);
              if (event.dataTransfer?.files?.[0]) selectFile(event.dataTransfer.files[0]);
            }}
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
              onChange={(event) => selectFile(event.target.files?.[0])}
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
            <Alert severity={result.summary.failed ? 'warning' : 'success'}>
              Total {result.summary.total}: categories created {result.summary.created}, parents created{' '}
              {result.summary.parents_created || 0}, skipped {result.summary.skipped || 0}, failed{' '}
              {result.summary.failed}
              {result.result_csv && (
                <Button
                  size="small"
                  onClick={() => downloadText('categories-import-result.csv', result.result_csv)}
                  sx={{ ml: 1 }}
                >
                  Download result CSV
                </Button>
              )}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Close
        </Button>
        <Button variant="contained" onClick={handleUpload} disabled={!file || uploading}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CategoriesBulkUploadDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onDone: PropTypes.func
};
