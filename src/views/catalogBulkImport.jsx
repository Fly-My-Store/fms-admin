'use client';

import { useCallback, useRef, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { InboxOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import { bulkImportCatalog, downloadCatalogImportExample } from 'api/catalog';

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
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const dragDepthRef = useRef(0);

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
      const resp = await bulkImportCatalog(form, (evt) => {
        if (!evt.total) return;
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      const data = resp?.data || resp;
      setResult(data);
      const failed = data?.summary?.failed || 0;
      const firstError = (data?.rows || []).find((r) => r.status === 'failed' && r.error)?.error;
      enqueueSnackbar(
        failed
          ? firstError
            ? `Import finished with ${failed} failed row(s). ${firstError}`
            : `Import finished with ${failed} failed row(s)`
          : `Import OK — ${data?.summary?.created || 0} variant(s) created`,
        { variant: failed ? 'warning' : 'success' }
      );
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Import failed', { variant: 'error' });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const downloadResultCsv = () => {
    if (!result?.result_csv) return;
    const blob = new Blob([result.result_csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'catalog-import-result.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExample = async () => {
    try {
      await downloadCatalogImportExample();
    } catch {
      enqueueSnackbar('Failed to download example CSV', { variant: 'error' });
    }
  };

  const failedRows = (result?.rows || []).filter((r) => r.status === 'failed');
  const summary = result?.summary;

  return (
    <MainCard title="Catalog Bulk Import">
      <Stack spacing={2}>
        <Alert severity="info">
          Upload a <strong>.zip</strong> with <code>catalog.csv</code> + <code>images/</code>, or a <strong>.csv</strong> alone
          when all images are http(s) URLs. New brands, categories, products, and variants are created as{' '}
          <strong>INACTIVE</strong> — approve them under Pending pages. Duplicate SKUs fail that row only.
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
            cursor: 'pointer'
          }}
          onClick={() => inputRef.current?.click()}
        >
          <InboxOutlined style={{ fontSize: 36, opacity: 0.5 }} />
          <Typography sx={{ mt: 1 }}>Drag & drop CSV or ZIP here, or click to browse</Typography>
          {file ? (
            <Chip sx={{ mt: 1.5 }} label={file.name} onDelete={() => setFile(null)} />
          ) : (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Max ~200MB
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

        <Stack direction="row" spacing={1}>
          <Button variant="contained" disabled={!file || uploading} onClick={handleSubmit}>
            Run import
          </Button>
          {result?.result_csv && (
            <Button variant="outlined" onClick={downloadResultCsv}>
              Download result CSV
            </Button>
          )}
        </Stack>

        {summary && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
            <Chip label={`Total ${summary.total}`} />
            <Chip color="success" label={`Created ${summary.created}`} />
            <Chip color="error" label={`Failed ${summary.failed}`} />
            <Chip label={`Products created ${summary.products_created || 0}`} />
            <Chip label={`Existing products reused ${summary.skipped_existing_product || 0}`} />
          </Stack>
        )}

        {failedRows.length > 0 && (
          <Paper variant="outlined" sx={{ overflow: 'auto' }}>
            <Typography variant="subtitle1" sx={{ p: 1.5, pb: 0 }}>
              Errors
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Row</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Product</TableCell>
                    <TableCell>Error</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {failedRows.map((r) => (
                  <TableRow key={`${r.row}-${r.sku}`}>
                    <TableCell>{r.row}</TableCell>
                    <TableCell>{r.sku}</TableCell>
                    <TableCell>{r.product_name}</TableCell>
                    <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: 520 }}>
                      {r.error}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Stack>
    </MainCard>
  );
}
