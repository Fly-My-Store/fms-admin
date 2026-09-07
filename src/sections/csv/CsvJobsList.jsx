'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { downloadCsvJobFile } from 'api/csvJobs';

const ACTIVE = new Set(['QUEUED', 'RUNNING']);
/** Only poll while a job is in flight; idle lists stay until Refresh. */
const POLL_MS = 60_000;

function kindLabel(kind) {
  switch (kind) {
    case 'STORE_VARIANT_EXPORT':
      return 'Export listings';
    case 'STORE_VARIANT_UPDATE':
      return 'Update listings';
    case 'STORE_VARIANT_IMPORT':
      return 'Add listings';
    case 'CATALOG_IMPORT':
      return 'Catalog import';
    default:
      return kind || 'Job';
  }
}

function statusColor(status) {
  if (status === 'SUCCEEDED') return 'success';
  if (status === 'FAILED') return 'error';
  if (status === 'RUNNING') return 'info';
  return 'default';
}

function formatWhen(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function describeJob(job) {
  if (job.input_file_name) return job.input_file_name;
  const f = job.filter_json || {};
  const bits = [];
  if (f.q) bits.push(`search “${f.q}”`);
  if (f.stock_status === 'IN_STOCK') bits.push('in stock');
  if (f.stock_status === 'OUT_OF_STOCK') bits.push('out of stock');
  if (f.status) bits.push(String(f.status).toLowerCase());
  if (f.category_id) bits.push('category filter');
  return bits.length ? bits.join(' · ') : 'All listings';
}

function formatSummary(job) {
  const s = job.summary;
  if (!s) return '—';
  const bits = [];
  if (job.status === 'RUNNING' || job.status === 'QUEUED') {
    if (s.phase) bits.push(String(s.phase));
    if (s.processed != null) {
      bits.push(s.total != null ? `${s.processed}/${s.total}` : `${s.processed} processed`);
    }
  } else {
    if (s.total != null) bits.push(`${s.total} total`);
  }
  if (s.created) bits.push(`${s.created} created`);
  if (s.updated) bits.push(`${s.updated} updated`);
  if (s.failed) bits.push(`${s.failed} failed`);
  return bits.length ? bits.join(' · ') : '—';
}

export default function CsvJobsList({
  title,
  loadJobs,
  downloadPath,
  abortJob,
  emptyText,
  refreshKey = 0
}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const resp = await loadJobs();
      const list = Array.isArray(resp?.data) ? resp.data : [];
      setJobs(list);
      setError(null);
      return list;
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load jobs');
      return [];
    } finally {
      setLoading(false);
    }
  }, [loadJobs]);

  useEffect(() => {
    let cancelled = false;
    let timer;
    const tick = async () => {
      const list = await refresh();
      if (cancelled) return;
      // No live updates when idle — admin can Refresh. In-flight jobs: at most once a minute.
      if (list.some((j) => ACTIVE.has(j.status))) {
        timer = setTimeout(tick, POLL_MS);
      }
    };
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [refresh, refreshKey]);

  const onDownload = async (job, file) => {
    try {
      await downloadCsvJobFile(downloadPath(job.id, file));
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Download failed', { variant: 'error' });
    }
  };

  const onAbort = async (job, action) => {
    if (!abortJob) return;
    const label = action === 'requeue' ? 'Requeue' : 'Stop';
    if (!window.confirm(`${label} this job?`)) return;
    setActingId(job.id);
    try {
      await abortJob(job.id, { action });
      enqueueSnackbar(action === 'requeue' ? 'Job requeued' : 'Job stopped', { variant: 'success' });
      await refresh();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || `${label} failed`, { variant: 'error' });
    } finally {
      setActingId(null);
    }
  };

  return (
    <MainCard
      title={title || 'CSV jobs'}
      secondary={
        <Button size="small" variant="text" onClick={() => refresh()} disabled={loading}>
          Refresh
        </Button>
      }
    >
      {loading && !jobs.length ? (
        <Stack alignItems="center" py={2}>
          <CircularProgress size={22} />
        </Stack>
      ) : null}
      {error ? <Alert severity="error">{error}</Alert> : null}
      {!loading && !error && jobs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {emptyText || 'No CSV jobs yet.'}
        </Typography>
      ) : null}
      {jobs.length > 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>File / filters</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Summary</TableCell>
                <TableCell>Started</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} hover>
                  <TableCell>{kindLabel(job.kind)}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{describeJob(job)}</Typography>
                    {job.error_message ? (
                      <Typography variant="caption" color="error">
                        {job.error_message}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" color={statusColor(job.status)} label={job.status} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{formatSummary(job)}</Typography>
                  </TableCell>
                  <TableCell>{formatWhen(job.started_at || job.created_at)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                      {job.result_file_url ? (
                        <Button size="small" onClick={() => onDownload(job, 'result')}>
                          Download
                        </Button>
                      ) : null}
                      {job.error_file_url ? (
                        <Button size="small" color="warning" onClick={() => onDownload(job, 'error')}>
                          Download errors
                        </Button>
                      ) : null}
                      {abortJob && ACTIVE.has(job.status) ? (
                        <>
                          <Button
                            size="small"
                            color="error"
                            disabled={actingId === job.id}
                            onClick={() => onAbort(job, 'fail')}
                          >
                            Stop
                          </Button>
                          <Button
                            size="small"
                            disabled={actingId === job.id}
                            onClick={() => onAbort(job, 'requeue')}
                          >
                            Requeue
                          </Button>
                        </>
                      ) : null}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </MainCard>
  );
}

CsvJobsList.propTypes = {
  title: PropTypes.string,
  loadJobs: PropTypes.func.isRequired,
  downloadPath: PropTypes.func.isRequired,
  abortJob: PropTypes.func,
  emptyText: PropTypes.string,
  refreshKey: PropTypes.number
};
