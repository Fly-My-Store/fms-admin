'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BasicReactTable from 'components/tables/basicTable';
import { RECORD_STATUS } from 'utils/constants';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

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

export default function FoodCravingsTableSection({
  rows,
  handleAddButton,
  handleEditButton,
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
        header: 'Tile',
        id: 'tile',
        cell: ({ row }) => {
          const data = row.original;
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  bgcolor: 'action.hover',
                  backgroundImage: data.image_url ? `url(${data.image_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <Stack spacing={0.25} minWidth={0}>
                <Typography variant="subtitle2" noWrap>
                  {safe(data.label)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {safe(data.slug)} · sort {safe(data.sort_order)}
                </Typography>
              </Stack>
            </Stack>
          );
        }
      },
      {
        header: 'Match terms',
        id: 'match_terms',
        cell: ({ row }) => {
          const terms = Array.isArray(row.original.match_terms) ? row.original.match_terms : [];
          if (!terms.length) return <Typography variant="body2">—</Typography>;
          return (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {terms.slice(0, 6).map((term) => (
                <Chip key={term} size="small" label={term} variant="light" />
              ))}
              {terms.length > 6 ? (
                <Chip size="small" label={`+${terms.length - 6}`} variant="outlined" />
              ) : null}
            </Stack>
          );
        }
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
      title="Food cravings"
      ariaLebel="Add food craving"
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
    />
  );
}
