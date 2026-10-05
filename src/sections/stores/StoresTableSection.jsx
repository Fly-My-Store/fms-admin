'use client';

import { useMemo } from 'react';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { EnvironmentOutlined } from '@ant-design/icons';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';
import IconButton from 'components/@extended/IconButton';
import { useCan } from 'hooks/useCan';
import {
  adminOpenBlockedReason,
  canAdminOpenStore,
  storeAvailabilityLabel,
} from 'utils/storeAvailability';

const isFullyVerified = (row) => {
  const seller = row?.seller;
  return (
    seller?.kyc_status === 'APPROVED' &&
    seller?.kyb_status === 'APPROVED' &&
    row?.kyb_status === 'APPROVED'
  );
};

const combinedVerificationLabel = (row) => (isFullyVerified(row) ? 'Approved' : 'Pending');

const combinedVerificationTooltip = (row) => {
  const seller = row?.seller;
  return [
    `Seller KYC: ${seller?.kyc_status || '—'}`,
    `Seller KYB: ${seller?.kyb_status || '—'}`,
    `Store KYB: ${row?.kyb_status || '—'}`,
  ].join(' · ');
};

const mapsUrl = (row) => {
  const lat = row?.lat;
  const lng = row?.lng;
  if (lat != null && lng != null && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
  const addr = String(row?.address_text || '').trim();
  if (addr) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
  return null;
};

function OpenToggleCell({ row, onToggleOpen, canToggle, togglingId }) {
  const data = row.original;
  const checked = Boolean(data.accepting_orders ?? data.is_open);
  const busy = togglingId === data.id;
  const tillLine = storeAvailabilityLabel(data);
  const canOpen = canAdminOpenStore(data);
  const openBlockedReason = adminOpenBlockedReason(data);
  // Closing is always allowed; opening requires verification + ACTIVE.
  const switchDisabled = busy || (!checked && !canOpen);

  if (!canToggle || !onToggleOpen) {
    return (
      <Stack spacing={0.25}>
        <Chip
          size="small"
          variant="light"
          color={checked ? 'success' : 'default'}
          label={checked ? 'Open' : 'Closed'}
        />
        <Typography variant="caption" color="text.secondary" noWrap>
          {tillLine}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={0.25} sx={{ minWidth: 140 }}>
      <Tooltip title={!checked && openBlockedReason ? openBlockedReason : ''}>
        <span>
          <FormControlLabel
            sx={{ m: 0, mr: 0 }}
            control={
              <Switch
                size="small"
                checked={checked}
                disabled={switchDisabled}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleOpen(data, e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
                inputProps={{ 'aria-label': checked ? 'Close store' : 'Open store' }}
              />
            }
            label={
              <Typography variant="caption" color={checked ? 'success.main' : 'text.secondary'}>
                {checked ? 'Open' : 'Closed'}
              </Typography>
            }
          />
        </span>
      </Tooltip>
      <Typography variant="caption" color="text.secondary" noWrap title={tillLine}>
        {tillLine}
      </Typography>
      {!checked && openBlockedReason ? (
        <Typography variant="caption" color="warning.main" noWrap title={openBlockedReason}>
          {openBlockedReason}
        </Typography>
      ) : null}
    </Stack>
  );
}

export default function StoresTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  handleViewButton,
  totalCount,
  topActionsLeft,
  topActions,
  showPagination = true,
  onToggleOpen,
  togglingId = null,
}) {
  const { canModify } = useCan();
  const canToggle = canModify('store');

  const columns = useMemo(
    () => [
      {
        header: 'Store',
        accessorKey: 'name',
        cell: ({ row }) => {
          const data = row.original;
          return (
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar
                src={data.logo_thumb_url || data.logo_url || undefined}
                alt={data.name || 'Store'}
                variant="rounded"
                sx={{ width: 36, height: 36 }}
              >
                {(data.name || '?').slice(0, 1).toUpperCase()}
              </Avatar>
              <Stack spacing={0.25}>
                <Typography variant="subtitle2">{data.name || '—'}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {[data.code, data.slug].filter(Boolean).join(' · ') || '—'}
                </Typography>
                {data.seller?.legal_name ? (
                  <Typography variant="caption" color="text.secondary">
                    {data.seller.legal_name}
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          );
        },
      },
      {
        header: 'Open / close',
        id: 'timings',
        cell: ({ row }) => (
          <OpenToggleCell
            row={row}
            onToggleOpen={onToggleOpen}
            canToggle={canToggle}
            togglingId={togglingId}
          />
        ),
      },
      {
        header: 'Location',
        id: 'location',
        cell: ({ row }) => {
          const url = mapsUrl(row.original);
          if (!url) return '—';
          return (
            <IconButton
              size="small"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <EnvironmentOutlined style={{ fontSize: '16px' }} />
            </IconButton>
          );
        },
      },
      {
        header: 'KYC',
        id: 'kyc',
        meta: { sx: { whiteSpace: 'nowrap' } },
        cell: ({ row }) => {
          const data = row.original;
          const approved = isFullyVerified(data);
          return (
            <Tooltip title={combinedVerificationTooltip(data)}>
              <Chip
                color={approved ? 'success' : 'default'}
                label={combinedVerificationLabel(data)}
                size="small"
                variant="light"
              />
            </Tooltip>
          );
        },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (cell) => {
          const value = cell.getValue();
          switch (value) {
            case TABLE_STATUS.ACTIVE:
              return <Chip color="success" label="Active" size="small" variant="light" />;
            case TABLE_STATUS.INACTIVE:
              return <Chip color="warning" label="Inactive" size="small" variant="light" />;
            case TABLE_STATUS.SUSPENDED:
              return <Chip color="error" label="Suspended" size="small" variant="light" />;
            case TABLE_STATUS.DELETED:
              return <Chip color="default" label="Deleted" size="small" variant="light" />;
            default:
              return <Chip color="default" label={value || 'Unknown'} size="small" variant="light" />;
          }
        },
      },
    ],
    [canToggle, onToggleOpen, togglingId]
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Stores"
      ariaLebel="Add Store"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      totalCount={totalCount}
      topActionsLeft={topActionsLeft}
      topActions={topActions}
      showPagination={showPagination}
      permissionName={'store'}
      handleViewButton={handleViewButton}
    />
  );
}
