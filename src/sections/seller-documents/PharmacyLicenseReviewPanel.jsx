'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import {
  listSellerDocuments,
  updateSellerDocument,
  verifySellerDocument,
} from 'api/sellersStores';

export default function PharmacyLicenseReviewPanel({ sellerId, isPharmacy, onChanged }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [doc, setDoc] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  const load = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const res = await listSellerDocuments(sellerId, { limit: 50 });
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res?.rows) ? res.rows : [];
      const licenses = list
        .filter((d) => d.doc_type === 'PHARMACY_LICENSE')
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setDoc(licenses[0] || null);
      setDeclineReason(licenses[0]?.reviewer_note || '');
    } catch (e) {
      enqueueSnackbar(e?.message || 'Failed to load pharmacy license', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    load();
  }, [load]);

  const onApprove = async () => {
    if (!doc?.id || !sellerId) return;
    setSaving(true);
    try {
      await verifySellerDocument(sellerId, doc.id);
      enqueueSnackbar('Pharmacy license approved', { variant: 'success' });
      await load();
      onChanged?.();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Approve failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const onDecline = async () => {
    if (!doc?.id || !sellerId) return;
    const note = String(declineReason || '').trim();
    if (!note) {
      enqueueSnackbar('Decline reason is required', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      await updateSellerDocument(sellerId, doc.id, {
        verification_status: 'REJECTED',
        remarks: note,
      });
      enqueueSnackbar('Pharmacy license declined', { variant: 'success' });
      await load();
      onChanged?.();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Decline failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!sellerId) return null;

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1">Pharmacy license</Typography>
      <Typography variant="body2" color="text.secondary">
        Seller uploads a drug/pharmacy license from the seller app. Approving sets pharmacy eligibility
        ({`is_pharmacy=${isPharmacy ? 'true' : 'false'}`} currently).
      </Typography>
      {loading ? (
        <CircularProgress size={22} />
      ) : !doc ? (
        <Alert severity="info">No pharmacy license uploaded yet.</Alert>
      ) : (
        <>
          <Typography variant="body2">
            Status: <strong>{doc.verified_status || 'UNKNOWN'}</strong>
          </Typography>
          {doc.file_url ? (
            <Link href={doc.file_url} target="_blank" rel="noopener noreferrer">
              View uploaded license
            </Link>
          ) : null}
          {doc.verified_status === 'REJECTED' && doc.reviewer_note ? (
            <Alert severity="warning">Previous decline reason: {doc.reviewer_note}</Alert>
          ) : null}
          {(doc.verified_status === 'PENDING' || doc.verified_status === 'REJECTED') && (
            <TextField
              size="small"
              label="Decline reason"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          )}
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="success"
              disabled={saving || doc.verified_status === 'APPROVED'}
              onClick={onApprove}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="error"
              disabled={saving || doc.verified_status === 'APPROVED'}
              onClick={onDecline}
            >
              Decline
            </Button>
            <Button variant="text" disabled={saving} onClick={load}>
              Refresh
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
}

PharmacyLicenseReviewPanel.propTypes = {
  sellerId: PropTypes.string,
  isPharmacy: PropTypes.bool,
  onChanged: PropTypes.func,
};
