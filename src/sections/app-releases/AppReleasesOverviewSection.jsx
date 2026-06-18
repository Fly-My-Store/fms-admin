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
import MainCard from 'components/MainCard';
import { CopyOutlined, LinkOutlined, UploadOutlined } from '@ant-design/icons';
import {
  APP_RELEASE_TYPES,
  formatFileSize,
  getCurrentRelease,
} from 'api/appReleases';
import UploadApkDialog from './UploadApkDialog';
import { useRouter } from 'next/navigation';

const APPS = [
  {
    appType: APP_RELEASE_TYPES.CUSTOMER,
    label: 'Customer',
    description: 'Fly My Store customer app',
    manageHref: '/app-releases/customer',
  },
  {
    appType: APP_RELEASE_TYPES.SELLER,
    label: 'Seller',
    description: 'Seller / store management app',
    manageHref: '/app-releases/seller',
  },
  {
    appType: APP_RELEASE_TYPES.RIDER,
    label: 'Rider',
    description: 'Delivery rider app',
    manageHref: '/app-releases/rider',
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

export default function AppReleasesOverviewSection() {
  const router = useRouter();
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
            const res = await getCurrentRelease(appType);
            return [appType, res?.data || null];
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
    <MainCard>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4">App releases</Typography>
        <Typography variant="body2" color="text.secondary">
          Latest Android APK for each app. Upload here or open a app page for full history.
        </Typography>
      </Stack>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {APPS.map(({ appType, label, description, manageHref }) => {
            const release = releases[appType];
            return (
              <Grid key={appType} size={{ xs: 12, md: 4 }}>
                <Card variant="outlined" sx={{ height: '100%' }} onClick={() => router.push(manageHref)}>
                  <CardContent>
                    <Stack spacing={2} sx={{ height: '100%' }}>
                      <Box>
                        <Typography variant="h6">{label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {description}
                        </Typography>
                      </Box>

                      {release ? (
                        <Stack spacing={1}>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip label={`v${release.version}`} color="primary" size="small" />
                            {release.version_code != null ? (
                              <Chip label={`code ${release.version_code}`} size="small" variant="outlined" />
                            ) : null}
                          </Stack>
                          <Typography variant="body2" fontFamily="monospace" noWrap title={release.file_name}>
                            {release.file_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(release.file_size_bytes)} · {formatDate(release.createdAt)}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                          No current release. Upload an APK to enable downloads.
                        </Typography>
                      )}

                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 'auto', pt: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<UploadOutlined />}
                          onClick={() => setUploadAppType(appType)}
                        >
                          Upload
                        </Button>
                        {release ? (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CopyOutlined />}
                              onClick={() => handleCopyLink(release.file_url)}
                            >
                              Copy link
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              component="a"
                              href={release.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<LinkOutlined />}
                            >
                              Open
                            </Button>
                          </>
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
    </MainCard>
  );
}
