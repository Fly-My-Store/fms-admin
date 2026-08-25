'use client';

import PropTypes from 'prop-types';
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Divider,
  Stack,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import { RECORD_STATUS, TABLE_STATUS } from 'utils/constants';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

function RecordStatusChip({ value }) {
  const map = {
    1: { color: 'success', label: 'Active' },
    2: { color: 'warning', label: 'Inactive' },
    3: { color: 'default', label: 'Archived' }
  };
  const meta = map?.[value] ?? { color: 'default', label: safe(value) };
  return <Chip size="small" color={meta.color} label={meta.label} variant="light" />;
}

function StatusChip({ value, prefix = '' }) {
  const color =
    value === 'APPROVED'
      ? 'success'
      : value === 'REJECTED' || value === 'RESUBMIT'
        ? 'error'
        : value === 'IN_REVIEW'
          ? 'warning'
          : 'default';
  const label = value ? `${prefix}${value}` : `${prefix}—`;
  return <Chip size="small" color={color} label={label} variant="outlined" />;
}

function AccountStatusChip({ value }) {
  switch (Number(value)) {
    case TABLE_STATUS.ACTIVE:
      return "Active";
    case TABLE_STATUS.INACTIVE:
      return "Inactive";
    case TABLE_STATUS.SUSPENDED:
      return "Suspended";
    default:
      return safe(value);
  }
}

const KV = ({ label, value }) => (
  <Stack direction="row" spacing={1} alignItems="baseline">
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60, flexShrink: 0 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
      {safe(value)}
    </Typography>
  </Stack>
);

const SectionTitle = ({ children }) => (
  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
    {children}
  </Typography>
);

export default function StoreDetailSidebar({ data, seller, sellerUser, ownerPhone, onEdit }) {
  if (!data) return null;

  const needsAttention =
    ['PENDING', 'IN_REVIEW', 'REJECTED', 'RESUBMIT'].includes(seller?.kyc_status)
    || ['PENDING', 'REJECTED'].includes(seller?.kyb_status)
    || ['PENDING', 'REJECTED'].includes(data?.kyb_status);

  const recordLabel =
    Number(data.record_status) === RECORD_STATUS.ACTIVE
      ? 'Active'
      : Number(data.record_status) === RECORD_STATUS.INACTIVE
        ? 'Inactive'
        : 'Archived';

  return (
    <Stack spacing={2} sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
      {needsAttention && (
        <Alert severity="warning" variant="outlined">
          Verification needs attention — check the Verification tab.
        </Alert>
      )}

      <MainCard content={false} border={false} divider={false} showTitle={false}>
        <Stack spacing={2} sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={data?.logo_thumb_url || data?.logo_url || undefined}
              alt={data?.name || 'Store'}
              sx={{ width: 52, height: 52 }}
              variant="rounded"
            >
              {(data?.name || 'S').slice(0, 1).toUpperCase()}
            </Avatar>
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="h6" noWrap title={data?.name}>
                {safe(data?.name)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {safe(data?.code)} · {safe(data?.slug)}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                {data.id}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              variant="light"
              color={data?.is_open ? 'success' : 'default'}
              label={data?.is_open ? 'Open' : 'Closed'}
            />
            <RecordStatusChip value={data.record_status} />
            {data.is_demo ? <Chip size="small" color="warning" label="Demo" variant="light" /> : null}
          </Stack>

          <Button variant="contained" size="small" onClick={onEdit} sx={{ alignSelf: 'flex-start' }}>
            Edit store
          </Button>

          <Divider />

          <Stack spacing={1}>
            <SectionTitle>Account owner</SectionTitle>
            {sellerUser ? (
              <>
                <KV label="Name" value={sellerUser.name} />
                <KV label="Email" value={sellerUser.email} />
                <KV label="Phone" value={ownerPhone} />
                <KV label="Status" value={AccountStatusChip({ value: sellerUser.status })} />
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No user account linked.
              </Typography>
            )}
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <SectionTitle>Store</SectionTitle>
            <KV label="Phone" value={data.phone} />
            <KV label="Email" value={data.email} />
            <KV label="Support" value={data.support_phone || data.support_email} />
            <KV
              label="Hours"
              value={data.open_time && data.close_time ? `${data.open_time} – ${data.close_time}` : null}
            />
            <KV label="FSSAI" value={data.fssai_number} />
            <KV
              label="Rating"
              value={data.rating != null ? `${data.rating} (${data.rating_count ?? 0})` : null}
            />
            <KV label="Radius" value={data.delivery_radius_m != null ? `${data.delivery_radius_m} m` : null} />
            <KV label="Updated" value={formatDate(data.updated_at || data.updatedAt)} />
            <KV label="Status" value={data.status} />
            <KV label="Record" value={recordLabel} />
          </Stack>
        </Stack>
      </MainCard>
    </Stack>
  );
}

StoreDetailSidebar.propTypes = {
  data: PropTypes.object,
  seller: PropTypes.object,
  sellerUser: PropTypes.object,
  ownerPhone: PropTypes.string,
  onEdit: PropTypes.func
};
