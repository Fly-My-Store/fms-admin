'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function RidersTableSection({
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
        header: 'Rider',
        id: 'rider',
        cell: ({ row }) => {
          const user = row.original.user || row.original.User || {};
          const name = user.name || '—';
          const email = user.email;
          const phone = user.phone
            ? `${user.country_code ? `${user.country_code} ` : ''}${user.phone}`
            : null;

          return (
            <Stack spacing={0.25}>
              <Typography variant="subtitle2">{name}</Typography>
              {email ? (
                <Typography variant="caption" color="text.secondary">
                  {email}
                </Typography>
              ) : null}
              {phone ? (
                <Typography variant="caption" color="text.secondary">
                  {phone}
                </Typography>
              ) : null}
            </Stack>
          );
        }
      },
      {
        header: 'Vehicle',
        accessorFn: (row) => {
          const type = row.vehicle_type || '';
          const number = row.vehicle_number || '';
          if (!type && !number) return '—';
          if (!type) return number;
          if (!number) return type;
          return `${type} · ${number}`;
        }
      },
      {
        header: 'KYC',
        accessorKey: 'kyc_status',
        cell: (cell) => {
          const value = cell.getValue();
          switch (value) {
            case 'APPROVED':
              return <Chip color="success" label="Approved" size="small" variant="light" />;
            case 'IN_REVIEW':
              return <Chip color="info" label="In Review" size="small" variant="light" />;
            case 'REJECTED':
              return <Chip color="error" label="Rejected" size="small" variant="light" />;
            case 'RESUBMIT':
              return <Chip color="warning" label="Resubmit" size="small" variant="light" />;
            case 'PENDING':
            default:
              return <Chip color="default" label={value || 'Pending'} size="small" variant="light" />;
          }
        }
      },
      {
        header: 'Availability',
        accessorKey: 'availability_status',
        cell: (cell) => {
          const value = cell.getValue();
          const map = {
            OFFLINE: { color: 'default', label: 'Offline' },
            IDLE: { color: 'info', label: 'Idle' },
            ASSIGNED: { color: 'warning', label: 'Assigned' },
            ON_TRIP: { color: 'success', label: 'On Trip' }
          };
          const meta = map[value] || { color: 'default', label: value || 'Unknown' };
          return <Chip color={meta.color} label={meta.label} size="small" variant="light" />;
        }
      },
      {
        header: 'Status',
        accessorKey: 'record_status',
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
              return <Chip color="default" label="Unknown" size="small" variant="light" />;
          }
        }
      }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Riders"
      ariaLebel="Add Rider"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      handleViewButton={handleViewButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'rider'}
    />
  );
}
