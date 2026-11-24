'use client';

import { useCallback, useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { getPodCollectionSettings, updatePodCollectionSettings } from 'api/podCollectionSettings';

export default function PodCollectionSettingsView() {
  const [upiVpa, setUpiVpa] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPodCollectionSettings();
      const data = res?.data || res;
      setUpiVpa(data?.upi_vpa || '');
      setPayeeName(data?.payee_name || '');
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
      const res = await updatePodCollectionSettings({
        upi_vpa: upiVpa.trim(),
        payee_name: payeeName.trim(),
      });
      const data = res?.data || res;
      setUpiVpa(data?.upi_vpa || '');
      setPayeeName(data?.payee_name || '');
      enqueueSnackbar('Pay on delivery QR saved', { variant: 'success' });
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Failed to save', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Breadcrumbs
        custom
        heading="pod-qr"
        links={[
          { title: 'home', to: '/dashboard' },
          { title: 'finance' },
          { title: 'pod-qr' },
        ]}
      />
      <MainCard title="Company UPI">
        <Stack spacing={2} maxWidth={480}>
          <Alert severity="info">
            Riders show this UPI id as a QR when a customer pays on delivery. The rider still marks
            whether the customer paid cash or scanned the QR. The bank payment is not checked here.
          </Alert>
          <TextField
            label="UPI id"
            size="small"
            value={upiVpa}
            onChange={(e) => setUpiVpa(e.target.value)}
            disabled={loading || saving}
            placeholder="name@bank"
            helperText="Leave blank to hide the QR. Riders can then collect cash only."
          />
          <TextField
            label="Name on the QR"
            size="small"
            value={payeeName}
            onChange={(e) => setPayeeName(e.target.value)}
            disabled={loading || saving}
            inputProps={{ maxLength: 50 }}
            helperText="Shown in the customer's UPI app"
          />
          <Box>
            <Button variant="contained" onClick={onSave} disabled={loading || saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </Box>
        </Stack>
      </MainCard>
    </>
  );
}
