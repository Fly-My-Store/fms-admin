'use client';

import { useCallback, useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { getPartialOrderSettings, updatePartialOrderSettings } from 'api/partialOrderSettings';

export default function PartialOrderSettingsView() {
  const [percent, setPercent] = useState('70');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPartialOrderSettings();
      const data = res?.data || res;
      setPercent(String(data?.min_remaining_percent ?? 70));
    } catch (e) {
      enqueueSnackbar(e?.message || 'Failed to load settings', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async () => {
    setSaving(true);
    try {
      const res = await updatePartialOrderSettings({
        min_remaining_percent: Number(percent),
      });
      const data = res?.data || res;
      setPercent(String(data?.min_remaining_percent ?? percent));
      enqueueSnackbar('Partial order settings saved', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(e?.message || 'Failed to save', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs
        custom
        heading="partial-order"
        links={[
          { title: 'home', to: '/dashboard' },
          { title: 'finance' },
          { title: 'partial-order' },
        ]}
      />
      <MainCard title="Remaining items threshold">
        <Stack spacing={2} maxWidth={480}>
          <Alert severity="info">
            When a seller removes unavailable lines on a packing order, at least this percent of
            original lines must remain. Otherwise the order must be fully cancelled.
          </Alert>
          <TextField
            label="Minimum remaining %"
            type="number"
            size="small"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            inputProps={{ min: 1, max: 100 }}
            disabled={loading || saving}
            helperText="Example: 70 means at least 7 of 10 lines must still ship"
          />
          <Box>
            <Button variant="contained" onClick={onSave} disabled={loading || saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Applies to grocery and pharmacy partial removals only (out of stock, damaged, wrong
            price) while the order is packing.
          </Typography>
        </Stack>
      </MainCard>
    </>
  );
}
