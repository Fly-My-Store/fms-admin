'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
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
        header: 'Name',
        accessorFn: (row) => row.user?.name || row.User?.name || '—'
      },
      {
        header: 'Email',
        accessorFn: (row) => row.user?.email || row.User?.email || '—'
      },
      {
        header: 'Phone',
        accessorFn: (row) => {
          const user = row.user || row.User || {};
          const cc = user.country_code ? `${user.country_code} ` : '';
          return user.phone ? `${cc}${user.phone}` : '—';
        }
      },
      { header: 'Vehicle Type', accessorKey: 'vehicle_type' },
      { header: 'Vehicle Number', accessorKey: 'vehicle_number' },
      {
        header: 'KYC Status',
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
        header: 'Account Status',
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
              return <Chip color="default" label="Unknown" size="small" variant="light" />;
          }
        }
      },
      {
        header: 'Service Radius (km)',
        accessorKey: 'service_radius_km'
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
