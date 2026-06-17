'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BasicReactTable from 'components/tables/basicTable';
import { RECORD_STATUS } from 'utils/constants';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const formatDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const formatSchedule = (from, to) => {
  const start = formatDate(from);
  const end = formatDate(to);
  if (!start && !end) return 'Always on';
  if (start && end) return `${start} → ${end}`;
  if (start) return `From ${start}`;
  return `Until ${end}`;
};

function RecordStatusChip({ value }) {
  switch (Number(value)) {
    case RECORD_STATUS.ACTIVE:
      return <Chip color="success" label="Active" size="small" variant="light" />;
    case RECORD_STATUS.INACTIVE:
      return <Chip color="warning" label="Inactive" size="small" variant="light" />;
    case RECORD_STATUS.ARCHIVED:
      return <Chip color="default" label="Archived" size="small" variant="light" />;
    default:
      return <Chip color="default" label={safe(value)} size="small" variant="light" />;
  }
}

export default function BannersTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange
}) {
  const columns = useMemo(
    () => [
      {
        header: 'Banner',
        id: 'banner',
        cell: ({ row }) => {
          const data = row.original;
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 72,
                  height: 40,
                  borderRadius: 1,
                  overflow: 'hidden',
                  flexShrink: 0,
                  bgcolor: 'grey.100',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                {data.image_url ? (
                  <Box
                    component="img"
                    src={data.image_url}
                    alt={data.title || 'Banner'}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : null}
              </Box>
              <Stack spacing={0.25} minWidth={0}>
                <Typography variant="subtitle2" noWrap>
                  {safe(data.title)}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap fontFamily="monospace">
                  {data.id}
                </Typography>
              </Stack>
            </Stack>
          );
        }
      },
      {
        header: 'Deeplink',
        accessorKey: 'deeplink',
        cell: ({ row }) => (
          <Typography variant="body2" noWrap sx={{ maxWidth: 220 }} title={row.original.deeplink || ''}>
            {safe(row.original.deeplink)}
          </Typography>
        )
      },
      {
        header: 'Schedule',
        id: 'schedule',
        cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {formatSchedule(row.original.active_from, row.original.active_to)}
          </Typography>
        )
      },
      {
        header: 'Status',
        accessorKey: 'record_status',
        cell: ({ row }) => <RecordStatusChip value={row.original.record_status} />
      }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Banners"
      ariaLebel="Add Banner"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName="banner"
    />
  );
}
