'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import BasicReactTable from 'components/tables/basicTable';
import {
  CopyOutlined,
  DeleteTwoTone,
  LinkOutlined,
  StarOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  deleteRelease,
  formatFileSize,
  getCurrentRelease,
  listReleases,
  setCurrentRelease,
} from 'api/appReleases';
import UploadApkDialog from './UploadApkDialog';

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

async function copyText(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function AppReleasesSection({ appType, title, subtitle }) {
  const [current, setCurrent] = useState(null);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [error, setError] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const loadCurrent = useCallback(async () => {
    setLoadingCurrent(true);
    try {
      const res = await getCurrentRelease(appType);
      setCurrent(res?.data || null);
      setError(null);
    } catch (e) {
      const msg = String(e?.message || e || '');
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('no current')) {
        setCurrent(null);
      } else {
        setError(msg || 'Failed to load current release');
      }
    } finally {
      setLoadingCurrent(false);
    }
  }, [appType]);

  const fetchList = useCallback(
    async (pageNo = page, size = pageSize) => {
      try {
        const res = await listReleases(appType, { page: pageNo, limit: size });
        const data = res?.data || [];
        setRows(data);
        setTotalPages(res?.meta?.totalPages || 1);
        setError(null);
        return data;
      } catch (e) {
        setError(e?.message || 'Failed to load releases');
        return [];
      }
    },
    [appType, page, pageSize],
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([loadCurrent(), fetchList()]);
  }, [loadCurrent, fetchList]);

  useEffect(() => {
    loadCurrent();
  }, [loadCurrent]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleCopyLink = useCallback(async (url) => {
    const ok = await copyText(url);
    enqueueSnackbar(ok ? 'Download link copied' : 'Could not copy link', {
      variant: ok ? 'success' : 'error',
    });
  }, []);

  const handleSetCurrent = useCallback(async (row) => {
    try {
      await setCurrentRelease(row.id);
      enqueueSnackbar('Set as current release', { variant: 'success' });
      await refreshAll();
    } catch (e) {
      enqueueSnackbar(e?.message || 'Failed to update current release', { variant: 'error' });
    }
  }, [refreshAll]);

  const handleDelete = useCallback(async (row) => {
    if (!window.confirm(`Delete ${row.file_name}? This cannot be undone.`)) return;
    try {
      await deleteRelease(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      if (current?.id === row.id) {
        setCurrent(null);
      }
      enqueueSnackbar('Release deleted', { variant: 'success' });
      const data = await fetchList(page, pageSize);
      if (data.length === 0 && page > 1) {
        const prevPage = page - 1;
        setPage(prevPage);
        await fetchList(prevPage, pageSize);
      }
      await loadCurrent();
    } catch (e) {
      enqueueSnackbar(e?.message || 'Failed to delete release', { variant: 'error' });
      await refreshAll();
    }
  }, [current?.id, fetchList, loadCurrent, page, pageSize, refreshAll]);

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function'
      ? updater({ pageIndex: page - 1, pageSize })
      : updater;
    setPage(next.pageIndex + 1);
    setPageSize(next.pageSize);
  };

  const columns = useMemo(
    () => [
      {
        header: 'Version',
        accessorKey: 'version',
        cell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2">{row.original.version}</Typography>
            {row.original.is_current ? (
              <Chip label="Current" color="success" size="small" variant="light" />
            ) : null}
          </Stack>
        ),
      },
      {
        header: 'File',
        accessorKey: 'file_name',
        cell: ({ row }) => (
          <Typography variant="body2" fontFamily="monospace" noWrap sx={{ maxWidth: 220 }}>
            {row.original.file_name}
          </Typography>
        ),
      },
      {
        header: 'Size',
        accessorKey: 'file_size_bytes',
        cell: ({ row }) => formatFileSize(row.original.file_size_bytes),
      },
      {
        header: 'Uploaded',
        accessorKey: 'createdAt',
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Copy download link">
                <IconButton color="primary" onClick={() => handleCopyLink(item.file_url)}>
                  <CopyOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="Open APK">
                <IconButton
                  color="secondary"
                  component="a"
                  href={item.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkOutlined />
                </IconButton>
              </Tooltip>
              {!item.is_current ? (
                <Tooltip title="Set as current">
                  <IconButton color="warning" onClick={() => handleSetCurrent(item)}>
                    <StarOutlined />
                  </IconButton>
                </Tooltip>
              ) : null}
              <Tooltip title="Delete">
                <IconButton color="error" onClick={() => handleDelete(item)}>
                  <DeleteTwoTone />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [handleCopyLink, handleDelete, handleSetCurrent],
  );

  return (
    <Stack spacing={3}>
      <MainCard>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h4">{title}</Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          <Button
            variant="contained"
            startIcon={<UploadOutlined />}
            onClick={() => setUploadOpen(true)}
          >
            Upload new APK
          </Button>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Current release</Typography>
            {loadingCurrent ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            ) : current ? (
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip label={`v${current.version}`} color="primary" />
                  {current.version_code != null ? (
                    <Chip label={`code ${current.version_code}`} variant="outlined" />
                  ) : null}
                </Stack>
                <Typography variant="body2" fontFamily="monospace">{current.file_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(current.file_size_bytes)} · Uploaded {formatDate(current.createdAt)}
                </Typography>
                {current.notes ? (
                  <Typography variant="body2" color="text.secondary">{current.notes}</Typography>
                ) : null}
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button
                    variant="outlined"
                    startIcon={<CopyOutlined />}
                    onClick={() => handleCopyLink(current.file_url)}
                  >
                    Copy download link
                  </Button>
                  <Button
                    variant="outlined"
                    component="a"
                    href={current.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<LinkOutlined />}
                  >
                    Open APK
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No current release yet. Upload an APK to get started.
              </Typography>
            )}
          </CardContent>
        </Card>
      </MainCard>

      <BasicReactTable
        columns={columns}
        data={rows}
        title="Release history"
        ariaLebel="Upload APK"
        handleAddButton={() => setUploadOpen(true)}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        permissionName="appRelease"
        showActions={false}
      />

      <UploadApkDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        appType={appType}
        onSaved={async () => {
          setUploadOpen(false);
          await refreshAll();
        }}
      />
    </Stack>
  );
}

AppReleasesSection.propTypes = {
  appType: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};
