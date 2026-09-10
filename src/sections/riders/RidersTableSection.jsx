'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import BasicReactTable from 'components/tables/basicTable';
import { ACCOUNT_STATUS } from 'utils/constants';

/** Matches backend dispatch.service DEFAULT_MAX_AGE_MIN for live assignment. */
const LOCATION_FRESH_MINUTES = 30;

function hasGeom(row) {
  return Boolean(row?.geom || (row?.lat != null && row?.lng != null));
}

function locationAgeMinutes(lastLocationAt) {
  if (!lastLocationAt) return null;
  const ts = new Date(lastLocationAt).getTime();
  if (!Number.isFinite(ts)) return null;
  return Math.max(0, Math.round((Date.now() - ts) / 60000));
}

/** Compact age for chips: `<1m`, `12m`, `3h 20m`, `2d 4h`. */
function formatAgeLabel(ageMin) {
  if (ageMin == null || !Number.isFinite(ageMin)) return null;
  const minutes = Math.max(0, Math.round(ageMin));
  if (minutes < 1) return '<1m';
  if (minutes < 60) return `${minutes}m`;

  const days = Math.floor(minutes / (60 * 24));
  const hours = Math.floor((minutes % (60 * 24)) / 60);
  const mins = minutes % 60;

  if (days > 0) {
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatLastLocation(lastLocationAt) {
  if (!lastLocationAt) return 'Never';
  const d = new Date(lastLocationAt);
  if (!Number.isFinite(d.getTime())) return '—';
  return d.toLocaleString();
}

function LocationCell({ row }) {
  const lastAt = row.last_location_at;
  const ageMin = locationAgeMinutes(lastAt);
  const ageLabel = formatAgeLabel(ageMin);
  const geomOk = hasGeom(row);

  let freshness = { color: 'default', label: 'No location' };
  if (!geomOk || ageMin == null) {
    freshness = { color: 'error', label: 'No location' };
  } else if (ageMin > LOCATION_FRESH_MINUTES) {
    freshness = {
      color: 'warning',
      label: `Stale (${ageLabel})`
    };
  } else {
    freshness = {
      color: 'success',
      label: `Fresh (${ageLabel})`
    };
  }

  return (
    <Stack spacing={0.25}>
      <Tooltip
        title={
          geomOk
            ? `Live assign needs location within ${LOCATION_FRESH_MINUTES} min. Demo assign skips freshness.`
            : 'Assignment requires rider geom (GPS).'
        }
      >
        <Chip color={freshness.color} label={freshness.label} size="small" variant="light" sx={{ alignSelf: 'flex-start' }} />
      </Tooltip>
      <Typography variant="caption" color="text.secondary">
        {formatLastLocation(lastAt)}
      </Typography>
    </Stack>
  );
}

export default function RidersTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  handleViewButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  totalCount,
  topActionsLeft,
  topActions,
  showPagination = true
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
          const phone = user.phone || null;

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
        header: 'Location',
        id: 'location',
        cell: ({ row }) => <LocationCell row={row.original} />
      },
      {
        header: 'Screen guard',
        accessorKey: 'screen_guard_eligible',
        cell: (cell) => {
          const ok = Boolean(cell.getValue());
          return (
            <Tooltip title="Required to assign screen-guard product orders">
              <Chip
                color={ok ? 'success' : 'default'}
                label={ok ? 'Eligible' : 'No'}
                size="small"
                variant="light"
              />
            </Tooltip>
          );
        }
      },
      {
        header: 'Status',
        id: 'user_status',
        accessorFn: (row) => {
          const user = row.user || row.User || {};
          return user.status;
        },
        cell: (cell) => {
          const value = cell.getValue();
          switch (value) {
            case ACCOUNT_STATUS.ACTIVE:
              return <Chip color="success" label="Active" size="small" variant="light" />;
            case ACCOUNT_STATUS.INACTIVE:
              return <Chip color="warning" label="Inactive" size="small" variant="light" />;
            case ACCOUNT_STATUS.SUSPENDED:
              return <Chip color="error" label="Suspended" size="small" variant="light" />;
            case ACCOUNT_STATUS.DELETED:
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
      totalCount={totalCount}
      topActionsLeft={topActionsLeft}
      topActions={topActions}
      showPagination={showPagination}
      permissionName={'rider'}
    />
  );
}
