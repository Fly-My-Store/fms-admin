'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { EnvironmentOutlined } from '@ant-design/icons';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';
import IconButton from 'components/@extended/IconButton';

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

const formatTimings = (row) => {
  const open = row?.open_time;
  const close = row?.close_time;
  if (!open && !close) return '—';
  return `${open || '—'} – ${close || '—'}`;
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

export default function StoresTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  handleViewButton
}) {
  const columns = useMemo(
    () => [
      {
        header: 'Store',
        accessorKey: 'name',
        cell: ({ row }) => {
          const data = row.original;
          return (
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
          );
        },
      },
      {
        header: 'Timings',
        id: 'timings',
        cell: ({ row }) => {
          const data = row.original;
          return (
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, flexWrap: 'nowrap' }}>
              <Typography variant="body2" noWrap>{formatTimings(data)}</Typography>
              <Chip
                size="small"
                variant="light"
                color={data.is_open ? 'success' : 'default'}
                label={data.is_open ? 'Open' : 'Closed'}
              />
            </Box>
          );
        },
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
    []
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
      permissionName={'store'}
      handleViewButton={handleViewButton}
    />
  );
}
