'use client';

import { useMemo } from 'react';
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

export default function FaqsTableSection({
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
        header: 'App',
        accessorKey: 'app_type',
        cell: ({ row }) => <Chip size="small" label={safe(row.original.app_type)} variant="light" />
      },
      {
        header: 'Section',
        id: 'section',
        cell: ({ row }) => (
          <Stack spacing={0.25} minWidth={0}>
            <Typography variant="subtitle2" noWrap>
              {safe(row.original.section_title)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              sort {safe(row.original.section_sort)} · item {safe(row.original.sort_order)}
            </Typography>
          </Stack>
        )
      },
      {
        header: 'Question',
        id: 'question',
        cell: ({ row }) => (
          <Stack spacing={0.25} minWidth={0} sx={{ maxWidth: 420 }}>
            <Typography variant="body2" noWrap title={row.original.question || ''}>
              {safe(row.original.question)}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap title={row.original.answer || ''}>
              {safe(row.original.answer)}
            </Typography>
          </Stack>
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
      title="FAQs"
      ariaLebel="Add FAQ"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
    />
  );
}
