'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const resolveStoreId = (row) =>
  row?.primary_store_id || row?.default_store_id || row?.primary_store?.id || row?.stores?.[0]?.id || null;

function VerificationChip({ value, prefix }) {
  const color =
    value === 'APPROVED' ? 'success' : value === 'REJECTED' ? 'error' : value === 'IN_REVIEW' ? 'warning' : 'default';
  return <Chip size="small" color={color} label={`${prefix}: ${value || 'Pending'}`} variant="light" />;
}

function AccountStatusChip({ value }) {
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
}

export default function SellersTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  handleViewStoreButton,
  handlePayoutButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange
}) {
  const columns = useMemo(
    () => [
      {
        header: 'Seller',
        id: 'seller',
        cell: ({ row }) => {
          const data = row.original;
          return (
            <Stack spacing={0.25}>
              <Typography variant="subtitle2">{safe(data.display_name || data.legal_name)}</Typography>
              {data.legal_name && data.display_name && data.legal_name !== data.display_name ? (
                <Typography variant="caption" color="text.secondary">
                  {data.legal_name}
                </Typography>
              ) : null}
              {data.user?.name ? (
                <Typography variant="caption" color="text.secondary">
                  Owner: {data.user.name}
                </Typography>
              ) : null}
            </Stack>
          );
        }
      },
      {
        header: 'Contact',
        id: 'contact',
        cell: ({ row }) => {
          const user = row.original?.user || {};
          const phone = user.phone
            ? `${user.country_code ? `${user.country_code} ` : ''}${user.phone}`
            : row.original?.support_phone;
          return (
            <Stack spacing={0.25}>
              <Typography variant="body2">{safe(user.email || row.original?.support_email)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {safe(phone)}
              </Typography>
            </Stack>
          );
        }
      },
      {
        header: 'Tax IDs',
        id: 'tax',
        cell: ({ row }) => {
          const data = row.original;
          return (
            <Stack spacing={0.25}>
              <Typography variant="body2" noWrap>
                GSTIN: {safe(data.gstin)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                PAN: {safe(data.pan)}
              </Typography>
            </Stack>
          );
        }
      },
      {
        header: 'Store',
        id: 'store',
        cell: ({ row }) => {
          const data = row.original;
          const store = data.primary_store || data.stores?.[0];
          const count = data.store_count ?? data.stores?.length ?? 0;
          if (!store) {
            return <Typography variant="body2" color="text.secondary">No store</Typography>;
          }
          return (
            <Stack spacing={0.25}>
              <Typography variant="body2">{store.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {[store.code, store.slug].filter(Boolean).join(' · ') || '—'}
                {count > 1 ? ` · +${count - 1} more` : ''}
              </Typography>
            </Stack>
          );
        }
      },
      {
        header: 'Verification',
        id: 'verification',
        cell: ({ row }) => {
          const data = row.original;
          return (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              <VerificationChip value={data.kyc_status} prefix="KYC" />
              <VerificationChip value={data.kyb_status} prefix="KYB" />
            </Stack>
          );
        }
      },
      {
        header: 'Account',
        id: 'account',
        cell: ({ row }) => <AccountStatusChip value={row.original?.user?.status} />
      }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Sellers"
      ariaLebel="Add Seller"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'seller'}
      tableActions={(row) => {
        const storeId = resolveStoreId(row);
        return (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Tooltip title={storeId ? 'Open store details (seller info)' : 'No store linked yet'}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={!storeId}
                  onClick={() => storeId && handleViewStoreButton?.(row)}
                >
                  Store
                </Button>
              </span>
            </Tooltip>
            {handlePayoutButton ? (
              <Button size="small" variant="outlined" onClick={() => handlePayoutButton(row)}>
                Payout
              </Button>
            ) : null}
          </Stack>
        );
      }}
    />
  );
}
