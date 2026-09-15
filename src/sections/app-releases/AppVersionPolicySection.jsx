'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { APP_RELEASE_TYPES } from 'api/appReleases';
import {
  DEFAULT_UPDATE_MESSAGE,
  DEFAULT_UPDATE_TITLE,
  formFromPolicy,
  indexPolicies,
  listVersionPolicies,
  policyKey,
  upsertVersionPolicy,
} from 'api/appVersionPolicies';
import { useCan } from 'hooks/useCan';
import MainCard from 'components/MainCard';

const APPS = [
  { appType: APP_RELEASE_TYPES.CUSTOMER, label: 'Customer' },
  { appType: APP_RELEASE_TYPES.SELLER, label: 'Seller' },
  { appType: APP_RELEASE_TYPES.RIDER, label: 'Rider' },
];

const PLATFORMS = [
  { key: 'ANDROID', label: 'Android' },
  { key: 'IOS', label: 'iOS' },
];

function PolicyForm({ appType, platform, initial, canEdit, onSaved }) {
  const [form, setForm] = useState(() => formFromPolicy(initial));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(formFromPolicy(initial));
  }, [initial]);

  const onChange = (field) => (event) => {
    const next = event?.target?.value;
    setForm((prev) => ({ ...prev, [field]: next == null ? '' : String(next) }));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const payload = {
        app_type: appType,
        platform,
        recommended_version: form.recommended_version || null,
        min_supported_version: form.min_supported_version || null,
        title: form.title?.trim() || DEFAULT_UPDATE_TITLE,
        message: form.message?.trim() || DEFAULT_UPDATE_MESSAGE,
        store_url: form.store_url || null,
      };
      const res = await upsertVersionPolicy(payload);
      enqueueSnackbar('Update policy saved', { variant: 'success' });
      onSaved?.(res?.data || null);
    } catch (e) {
      enqueueSnackbar(e?.message || 'Failed to save policy', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        <strong>Force</strong> when below minimum supported. <strong>Soft</strong> when below
        recommended but still supported. At or above recommended → no alert. Raise recommended only
        when you want to nudge — not on every store release.
      </Alert>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Minimum supported (force)"
            placeholder="1.0.10"
            value={form.min_supported_version ?? ''}
            onChange={onChange('min_supported_version')}
            fullWidth
            disabled={!canEdit}
            helperText="Below this → must update to continue"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Recommended version (soft)"
            placeholder="1.0.16"
            value={form.recommended_version ?? ''}
            onChange={onChange('recommended_version')}
            fullWidth
            disabled={!canEdit}
            helperText="Below this → optional update; at/above → no prompt"
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Title"
            placeholder={DEFAULT_UPDATE_TITLE}
            value={form.title ?? ''}
            onChange={onChange('title')}
            fullWidth
            disabled={!canEdit}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Message"
            placeholder={DEFAULT_UPDATE_MESSAGE}
            value={form.message ?? ''}
            onChange={onChange('message')}
            fullWidth
            multiline
            minRows={2}
            disabled={!canEdit}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            label="Store URL override (optional)"
            value={form.store_url ?? ''}
            onChange={onChange('store_url')}
            fullWidth
            disabled={!canEdit}
            helperText="Leave blank to use the default Play / App Store listing."
          />
        </Grid>
      </Grid>

      {canEdit ? (
        <Box>
          <Button variant="contained" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save policy'}
          </Button>
        </Box>
      ) : null}
    </Stack>
  );
}

PolicyForm.propTypes = {
  appType: PropTypes.string.isRequired,
  platform: PropTypes.string.isRequired,
  initial: PropTypes.object,
  canEdit: PropTypes.bool,
  onSaved: PropTypes.func,
};

export default function AppVersionPolicySection() {
  const { canModify, canRead } = useCan();
  const canEdit = canModify('appRelease');
  const canView = canRead('appRelease');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [byKey, setByKey] = useState({});
  const [appIndex, setAppIndex] = useState(0);
  const [platform, setPlatform] = useState('ANDROID');

  const selectedApp = APPS[appIndex] || APPS[0];

  const load = useCallback(async () => {
    if (!canView) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await listVersionPolicies();
      setByKey(indexPolicies(res?.data || []));
    } catch (e) {
      setError(e?.message || 'Failed to load update policies');
    } finally {
      setLoading(false);
    }
  }, [canView]);

  useEffect(() => {
    load();
  }, [load]);

  const current = useMemo(() => {
    if (!selectedApp) return null;
    return byKey[policyKey(selectedApp.appType, platform)] || null;
  }, [byKey, platform, selectedApp]);

  if (!canView) {
    return (
      <MainCard title="App Updates">
        <Alert severity="warning">You do not have permission to view app update policies.</Alert>
      </MainCard>
    );
  }

  return (
    <MainCard showTitle={false}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack spacing={2}>
            <Tabs
              value={appIndex}
              onChange={(_e, next) => setAppIndex(next)}
              variant="scrollable"
              allowScrollButtonsMobile
            >
              {APPS.map((app) => (
                <Tab key={app.appType} label={app.label} />
              ))}
            </Tabs>

            <Tabs
              value={platform}
              onChange={(_e, next) => setPlatform(next)}
              variant="scrollable"
              allowScrollButtonsMobile
            >
              {PLATFORMS.map((p) => (
                <Tab key={p.key} value={p.key} label={p.label} />
              ))}
            </Tabs>

            {selectedApp ? (
              <PolicyForm
                key={`${selectedApp.appType}:${platform}`}
                appType={selectedApp.appType}
                platform={platform}
                initial={current}
                canEdit={canEdit}
                onSaved={(row) => {
                  if (!row) return;
                  setByKey((prev) => ({
                    ...prev,
                    [policyKey(row.app_type, row.platform)]: row,
                  }));
                }}
              />
            ) : null}
          </Stack>
        )}
      </Stack>
    </MainCard>
  );
}
