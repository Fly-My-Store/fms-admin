'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

import { listSellerDocuments } from 'api/sellersStores';
import VerificationDocumentBox from './VerificationDocumentBox';

const DOC_LABELS = {
  GST: 'GST certificate',
  PAN: 'PAN card',
  AADHAAR: 'Aadhaar',
  SHOP_ACT: 'Shop Act / trade license',
  BANK_PROOF: 'Bank proof',
  ADDRESS_PROOF: 'Address proof',
  FSSAI: 'FSSAI license',
};

const GROUPS = [
  {
    key: 'seller_kyc',
    title: 'Seller KYC documents',
    hint: 'Identity documents (PAN, Aadhaar).',
    types: ['PAN', 'AADHAAR'],
    reasonHint: 'Required when KYC is REJECTED or RESUBMIT',
  },
  {
    key: 'seller_kyb',
    title: 'Seller KYB documents',
    hint: 'Business documents. GST certificate is optional.',
    types: ['GST', 'BANK_PROOF'],
    reasonHint: 'Required when seller KYB is REJECTED',
  },
  {
    key: 'store_kyb',
    title: 'Store KYB documents',
    hint: 'Store / premises documents. FSSAI license is optional.',
    types: ['SHOP_ACT', 'ADDRESS_PROOF', 'FSSAI'],
    reasonHint: 'Required when store KYB is REJECTED',
  },
];

const DEFAULT_KYC_STATUSES = ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMIT'];
const DEFAULT_KYB_STATUSES = ['NONE', 'PENDING', 'APPROVED', 'REJECTED'];

function mapDocs(items) {
  return items.map((doc) => ({
    id: doc.id,
    doc_type: doc.doc_type,
    file_url: doc.file_url,
    label: DOC_LABELS[doc.doc_type] || doc.doc_type,
  }));
}

export default function SellerKycDocumentsPanel({
  sellerId,
  editable = false,
  title = 'Verification',
  sellerKyc = {},
  sellerKyb = {},
  storeKyb = {},
  kycStatuses = DEFAULT_KYC_STATUSES,
  kybStatuses = DEFAULT_KYB_STATUSES,
  errors = {},
}) {
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState([]);

  const load = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    try {
      const res = await listSellerDocuments(sellerId, { limit: 50 });
      const list = Array.isArray(res?.data) ? res.data : [];
      setDocs(list.filter((d) => d.doc_type !== 'PHARMACY_LICENSE'));
    } catch (e) {
      enqueueSnackbar(e?.message || 'Failed to load documents', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    return GROUPS.map((group) => ({
      ...group,
      items: mapDocs(docs.filter((d) => group.types.includes(d.doc_type))),
    }));
  }, [docs]);

  const boxProps = {
    seller_kyc: {
      status: sellerKyc.status,
      reason: sellerKyc.reason,
      onStatusChange: sellerKyc.onStatusChange,
      onReasonChange: sellerKyc.onReasonChange,
      statusOptions: kycStatuses,
      statusError: errors['seller.kyc_status'],
      reasonError: errors['seller.kyc_reason'],
      reasonHint: GROUPS[0].reasonHint,
    },
    seller_kyb: {
      status: sellerKyb.status,
      reason: sellerKyb.reason,
      onStatusChange: sellerKyb.onStatusChange,
      onReasonChange: sellerKyb.onReasonChange,
      statusOptions: kybStatuses,
      statusError: errors['seller.kyb_status'],
      reasonError: errors['seller.kyb_reason'],
      reasonHint: GROUPS[1].reasonHint,
    },
    store_kyb: {
      status: storeKyb.status,
      reason: storeKyb.reason,
      onStatusChange: storeKyb.onStatusChange,
      onReasonChange: storeKyb.onReasonChange,
      statusOptions: kybStatuses,
      statusError: errors['kyb_status'],
      reasonError: errors['kyb_reason'],
      reasonHint: GROUPS[2].reasonHint,
    },
  };

  if (!sellerId) {
    return editable ? (
      <Alert severity="info">Documents appear here after the store is linked to a seller.</Alert>
    ) : null;
  }

  return (
    <Stack spacing={2}>
      {title ? (
        <Stack spacing={0.5}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            Review uploaded documents and set verification status for each section.
          </Typography>
        </Stack>
      ) : null}
      {loading ? (
        <CircularProgress size={22} />
      ) : (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
          {grouped.map((group) => (
            <VerificationDocumentBox
              key={group.key}
              title={group.title}
              hint={group.hint}
              docs={group.items}
              editable={editable}
              {...boxProps[group.key]}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

SellerKycDocumentsPanel.propTypes = {
  sellerId: PropTypes.string,
  editable: PropTypes.bool,
  title: PropTypes.string,
  sellerKyc: PropTypes.shape({
    status: PropTypes.string,
    reason: PropTypes.string,
    onStatusChange: PropTypes.func,
    onReasonChange: PropTypes.func,
  }),
  sellerKyb: PropTypes.shape({
    status: PropTypes.string,
    reason: PropTypes.string,
    onStatusChange: PropTypes.func,
    onReasonChange: PropTypes.func,
  }),
  storeKyb: PropTypes.shape({
    status: PropTypes.string,
    reason: PropTypes.string,
    onStatusChange: PropTypes.func,
    onReasonChange: PropTypes.func,
  }),
  kycStatuses: PropTypes.arrayOf(PropTypes.string),
  kybStatuses: PropTypes.arrayOf(PropTypes.string),
  errors: PropTypes.object,
};
