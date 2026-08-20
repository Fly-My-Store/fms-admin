'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

import {
  listSellerDocuments,
  updateSellerDocument,
  verifySellerDocument,
} from 'api/sellersStores';
import VerificationDocumentBox from './VerificationDocumentBox';

const PHARMACY_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

export default function PharmacyLicenseReviewPanel({ sellerId, isPharmacy, editable = true, onChanged }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const res = await listSellerDocuments(sellerId, { limit: 50 });
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res?.rows) ? res.rows : [];
      const licenses = list
        .filter((d) => d.doc_type === 'PHARMACY_LICENSE')
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      const latest = licenses[0] || null;
      setDoc(latest);
      setStatus(latest?.verified_status || 'PENDING');
      setReason(latest?.reviewer_note || '');
    } catch (e) {
      enqueueSnackbar(e?.message || 'Failed to load pharmacy license', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    load();
  }, [load]);

  const docs = useMemo(() => {
    if (!doc) return [];
    return [{ id: doc.id, doc_type: 'PHARMACY_LICENSE', file_url: doc.file_url, label: 'Pharmacy license' }];
  }, [doc]);

  const onSave = async () => {
    if (!doc?.id || !sellerId) return;

    if (status === 'REJECTED' && !String(reason || '').trim()) {
      enqueueSnackbar('Reason is required when status is REJECTED', { variant: 'warning' });
      return;
    }

    if (status === doc.verified_status && status !== 'REJECTED') {
      enqueueSnackbar('No changes to save', { variant: 'info' });
      return;
    }

    setSaving(true);
    try {
      if (status === 'APPROVED') {
        await verifySellerDocument(sellerId, doc.id);
      } else if (status === 'REJECTED') {
        await updateSellerDocument(sellerId, doc.id, {
          verification_status: 'REJECTED',
          remarks: reason.trim(),
        });
      } else {
        enqueueSnackbar('Only APPROVED or REJECTED can be saved from here', { variant: 'info' });
        return;
      }
      enqueueSnackbar('Pharmacy license review saved', { variant: 'success' });
      await load();
      onChanged?.();
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Save failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (!sellerId) return null;

  if (loading) {
    return <CircularProgress size={22} />;
  }

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
      <Box sx={{ flex: { md: '1 1 0' }, minWidth: 0, maxWidth: { md: '33.333%' }, width: '100%' }}>
        <VerificationDocumentBox
        title="Pharmacy license"
        hint={`Drug / pharmacy license from the seller app. Approving sets pharmacy eligibility (is_pharmacy=${isPharmacy ? 'true' : 'false'}).`}
        docs={docs}
        status={editable ? status : doc?.verified_status}
        reason={editable ? reason : doc?.reviewer_note}
        statusOptions={PHARMACY_STATUSES}
        onStatusChange={setStatus}
        onReasonChange={setReason}
        editable={editable}
        reasonHint="Required when status is REJECTED"
        emptyMessage="No pharmacy license uploaded yet."
        footer={
          editable && doc ? (
            <Button
              size="small"
              variant="contained"
              disabled={saving || status === 'PENDING'}
              onClick={onSave}
            >
              Save review
            </Button>
          ) : null
        }
        />
      </Box>
    </Stack>
  );
}

PharmacyLicenseReviewPanel.propTypes = {
  sellerId: PropTypes.string,
  isPharmacy: PropTypes.bool,
  editable: PropTypes.bool,
  onChanged: PropTypes.func,
};
