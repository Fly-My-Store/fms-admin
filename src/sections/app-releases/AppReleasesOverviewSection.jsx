'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { enqueueSnackbar } from 'notistack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CopyOutlined, DownloadOutlined, LinkOutlined, UploadOutlined } from '@ant-design/icons';
import {
  APP_RELEASE_TYPES,
  formatFileSize,
  getPublicLatestRelease,
  normalizeReleaseRow,
} from 'api/appReleases';
import { useCan } from 'hooks/useCan';
import UploadApkDialog from './UploadApkDialog';

const APPS = [
  {
    appType: APP_RELEASE_TYPES.CUSTOMER,
    label: 'Customer',
    description: 'Shop from local stores and track deliveries',
    manageHref: '/app-releases/customer',
    accent: '#2563eb',
  },
  {
    appType: APP_RELEASE_TYPES.SELLER,
    label: 'Seller',
    description: 'Manage your store, orders, and inventory',
    manageHref: '/app-releases/seller',
    accent: '#16a34a',
  },
  {
    appType: APP_RELEASE_TYPES.RIDER,
    label: 'Rider',
    description: 'Accept delivery jobs and track earnings',
    manageHref: '/app-releases/rider',
    accent: '#d97706',
  },
];

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

const actionBtnSx = {
  flex: { xs: '1 1 calc(50% - 4px)', sm: '0 0 auto' },
  minWidth: { xs: 0, sm: 'auto' },
};

export default function AppReleasesOverviewSection() {
  const { canModify, canRead } = useCan();
  const canUpload = canModify('appRelease');
  const canManage = canRead('appRelease');

  const [releases, setReleases] = useState({
    [APP_RELEASE_TYPES.CUSTOMER]: null,
    [APP_RELEASE_TYPES.SELLER]: null,
    [APP_RELEASE_TYPES.RIDER]: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadAppType, setUploadAppType] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        APPS.map(async ({ appType }) => {
          try {
            const res = await getPublicLatestRelease(appType);
            return [appType, normalizeReleaseRow(res?.data || null)];
          } catch (e) {
            const msg = String(e?.message || e || '');
            if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('no current')) {
              return [appType, null];
            }
            throw e;
          }
        }),
      );
      setReleases(Object.fromEntries(results));
    } catch (e) {
      setError(e?.message || 'Failed to load app releases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCopyLink = async (url) => {
    const ok = await copyText(url);
    enqueueSnackbar(ok ? 'Download link copied' : 'Could not copy link', {
      variant: ok ? 'success' : 'error',
    });
  };

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 700 }}>
          Fly My Store apps
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
          Install the latest Android APK for each Fly My Store app. 
        </Typography>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {APPS.map(({ appType, label, description, manageHref, accent }) => {
            const release = releases[appType];
            const downloadUrl = release?.file_url;

            return (
              <Grid key={appType} size={12}>
                <Card
                  variant="outlined"
                  sx={{
                    borderLeftWidth: 4,
                    borderLeftColor: accent,
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
                    <Stack spacing={2}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h5" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                            {label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {description}
                          </Typography>
                        </Box>

                        {release ? (
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip label={`v${release.version}`} color="primary" size="small" />
                            {release.version_code != null ? (
                              <Chip label={`build ${release.version_code}`} size="small" variant="outlined" />
                            ) : null}
                          </Stack>
                        ) : null}
                      </Stack>

                      {release ? (
                        <Stack spacing={0.75}>
                          <Typography
                            variant="body2"
                            fontFamily="monospace"
                            sx={{ wordBreak: 'break-all' }}
                          >
                            {release.file_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(release.file_size_bytes)} · Updated {formatDate(release.createdAt)}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No release available yet. Check back soon.
                        </Typography>
                      )}

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {downloadUrl ? (
                          <Button
                            size="medium"
                            variant="contained"
                            component="a"
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<DownloadOutlined />}
                            sx={actionBtnSx}
                          >
                            Download APK
                          </Button>
                        ) : null}

                        {release ? (
                          <>
                            <Button
                              size="medium"
                              variant="outlined"
                              startIcon={<CopyOutlined />}
                              onClick={() => handleCopyLink(downloadUrl)}
                              sx={actionBtnSx}
                            >
                              Copy link
                            </Button>
                          </>
                        ) : null}

                        {canUpload ? (
                          <Button
                            size="medium"
                            variant="outlined"
                            color="secondary"
                            startIcon={<UploadOutlined />}
                            onClick={() => setUploadAppType(appType)}
                            sx={actionBtnSx}
                          >
                            Upload
                          </Button>
                        ) : null}

                        {canManage ? (
                          <Button
                            size="medium"
                            variant="outlined"
                            component={Link}
                            href={manageHref}
                            sx={actionBtnSx}
                          >
                            Manage history
                          </Button>
                        ) : null}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <UploadApkDialog
        open={!!uploadAppType}
        onClose={() => setUploadAppType(null)}
        appType={uploadAppType || APP_RELEASE_TYPES.CUSTOMER}
        onSaved={async () => {
          setUploadAppType(null);
          await loadAll();
        }}
      />
    </Box>
  );
}
