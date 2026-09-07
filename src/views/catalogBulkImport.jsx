'use client';

import { useCallback, useRef, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { InboxOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import CsvJobsList from 'sections/csv/CsvJobsList';
import { downloadCatalogImportExample } from 'api/catalog';
import {
  abortCatalogCsvJob,
  catalogCsvJobDownloadPath,
  enqueueCatalogCsvImport,
  enqueueCsvJobWithFile,
  listCatalogCsvJobs,
  presignCatalogCsvJob
} from 'api/csvJobs';

function isAllowedFile(file) {
  if (!file) return false;
  const name = String(file.name || '').toLowerCase();
  return name.endsWith('.csv') || name.endsWith('.zip');
}

export default function CatalogBulkImportView() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobsTick, setJobsTick] = useState(0);
  const inputRef = useRef(null);
  const dragDepthRef = useRef(0);
  const loadJobs = useCallback(() => listCatalogCsvJobs({ limit: 20 }), []);

  const onPick = (f) => {
    if (!isAllowedFile(f)) {
      enqueueSnackbar('Upload a .csv or .zip file', { variant: 'error' });
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

  const handleSubmit = async () => {
    if (!file) {
      enqueueSnackbar('Choose a CSV or ZIP first', { variant: 'warning' });
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      await enqueueCsvJobWithFile({
        file,
        presign: (body) => presignCatalogCsvJob(body),
        enqueueJson: (body) => enqueueCatalogCsvImport(body),
        enqueueForm: (form, config) => enqueueCatalogCsvImport(form, config),
        onProgress: setProgress
      });
      enqueueSnackbar('Queued — you can close this page.', { variant: 'success' });
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      setJobsTick((n) => n + 1);
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Could not queue import', { variant: 'error' });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleExample = async () => {
    try {
      await downloadCatalogImportExample();
    } catch {
      enqueueSnackbar('Failed to download example CSV', { variant: 'error' });
    }
  };

  return (
    <Stack spacing={2}>
      <MainCard title="Catalog Bulk Import">
        <Stack spacing={2}>
          <Alert severity="info">
            Upload a <strong>.zip</strong> with <code>catalog.csv</code> + <code>images/</code>, or a <strong>.csv</strong>{' '}
            alone when all images are http(s) URLs. New brands, categories, products, and variants are created as{' '}
            <strong>INACTIVE</strong> — approve them under Pending pages. Duplicate SKUs fail that row only. The import
            runs in the background; download the result or errors CSV from the jobs list.
          </Alert>

          <Button variant="outlined" size="small" onClick={handleExample} sx={{ alignSelf: 'flex-start' }}>
            Download example CSV
          </Button>

          <Paper
            variant="outlined"
            onDragEnter={(e) => {
              e.preventDefault();
              dragDepthRef.current += 1;
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              dragDepthRef.current -= 1;
              if (dragDepthRef.current <= 0) {
                dragDepthRef.current = 0;
                setDragActive(false);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            sx={{
              p: 4,
              textAlign: 'center',
              borderStyle: 'dashed',
              bgcolor: dragActive ? 'action.hover' : 'background.paper',
              cursor: uploading ? 'default' : 'pointer'
            }}
            onClick={() => !uploading && inputRef.current?.click()}
          >
            <InboxOutlined style={{ fontSize: 36, opacity: 0.5 }} />
            <Typography sx={{ mt: 1 }}>Drag & drop CSV or ZIP here, or click to browse</Typography>
            {file ? (
              <Chip sx={{ mt: 1.5 }} label={file.name} onDelete={() => !uploading && setFile(null)} />
            ) : (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Max 200MB
              </Typography>
            )}
            <input
              ref={inputRef}
              type="file"
              hidden
              accept=".csv,.zip,text/csv,application/zip"
              onChange={(e) => onPick(e.target.files?.[0])}
            />
          </Paper>

          {uploading && (
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Uploading… {progress}%
              </Typography>
              <LinearProgress variant={progress ? 'determinate' : 'indeterminate'} value={progress} />
            </Box>
          )}

          <Button variant="contained" disabled={!file || uploading} onClick={handleSubmit} sx={{ alignSelf: 'flex-start' }}>
            Queue import
          </Button>
        </Stack>
      </MainCard>

      <CsvJobsList
        title="Catalog import jobs"
        loadJobs={loadJobs}
        downloadPath={(jobId, fileKind) => catalogCsvJobDownloadPath(jobId, fileKind)}
        abortJob={(jobId, body) => abortCatalogCsvJob(jobId, body)}
        refreshKey={jobsTick}
        emptyText="Queued catalog imports show up here. You can leave this page while they run."
      />
    </Stack>
  );
}
