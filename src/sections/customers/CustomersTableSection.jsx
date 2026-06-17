'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

function AccountStatusChip({ value }) {
  switch (Number(value)) {
    case TABLE_STATUS.ACTIVE:
      return <Chip color="success" label="Active" size="small" variant="light" />;
    case TABLE_STATUS.INACTIVE:
      return <Chip color="warning" label="Inactive" size="small" variant="light" />;
    case TABLE_STATUS.SUSPENDED:
      return <Chip color="error" label="Suspended" size="small" variant="light" />;
    case TABLE_STATUS.DELETED:
      return <Chip color="default" label="Deleted" size="small" variant="light" />;
    default:
      return <Chip color="default" label={safe(value)} size="small" variant="light" />;
  }
}

export default function CustomersTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  handleViewButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange
}) {
  const columns = useMemo(
    () => [
      {
        header: 'Customer',
        id: 'customer',
        cell: ({ row }) => {
          const data = row.original;
          return (
            <Stack spacing={0.25}>
              <Typography variant="subtitle2">{safe(data.name || data.phone || data.email)}</Typography>
              {data.name && (data.phone || data.email) ? (
                <Typography variant="caption" color="text.secondary">
                  {[data.phone, data.email].filter(Boolean).join(' · ')}
                </Typography>
              ) : null}
            </Stack>
          );
        }
      },
      {
        header: 'Phone',
        id: 'phone',
        cell: ({ row }) => {
          const data = row.original;
          const phone = data.phone
            ? `${data.country_code ? `${data.country_code} ` : ''}${data.phone}`
            : '—';
          return <Typography variant="body2">{phone}</Typography>;
        }
      },
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }) => <Typography variant="body2">{safe(row.original.email)}</Typography>
      },
      {
        header: 'Joined',
        id: 'joined',
        cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {formatDate(row.original.created_at || row.original.createdAt)}
          </Typography>
        )
      },
      {
        header: 'Last login',
        id: 'last_login',
        cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {formatDate(row.original.last_login_at)}
          </Typography>
        )
      },
      {
        header: 'Account',
        accessorKey: 'status',
        cell: ({ row }) => <AccountStatusChip value={row.original.status} />
      }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Customers"
      ariaLebel="Add Customer"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      handleViewButton={handleViewButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName="user"
    />
  );
}
