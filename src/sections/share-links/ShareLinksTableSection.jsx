'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { CopyOutlined } from '@ant-design/icons';
import IconButton from 'components/@extended/IconButton';
import BasicReactTable from 'components/tables/basicTable';
import { RECORD_STATUS } from 'utils/constants';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

function StatusChip({ value }) {
  switch (Number(value)) {
    case RECORD_STATUS.ACTIVE:
      return <Chip color="success" label="Active" size="small" variant="light" />;
    case RECORD_STATUS.INACTIVE:
      return <Chip color="warning" label="Disabled" size="small" variant="light" />;
    default:
      return <Chip color="default" label={safe(value)} size="small" variant="light" />;
  }
}

function copyText(text) {
  if (!text) return;
  navigator.clipboard?.writeText(text).catch(() => {});
}

export default function ShareLinksTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  totalCount,
  topActionsLeft
}) {
  const columns = useMemo(
    () => [
      {
        header: 'Code',
        accessorKey: 'code',
        cell: ({ row }) => {
          const url = row.original.url || '';
          return (
            <Stack spacing={0.25} minWidth={0}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="subtitle2" fontFamily="monospace">
                  {safe(row.original.code)}
                </Typography>
                <Tooltip title="Copy URL">
                  <IconButton color="secondary" size="small" onClick={() => copyText(url)}>
                    <CopyOutlined />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography variant="caption" color="text.secondary" noWrap title={url} sx={{ maxWidth: 280 }}>
                {safe(url)}
              </Typography>
            </Stack>
          );
        }
      },
      {
        header: 'Destination',
        id: 'destination',
        cell: ({ row }) => (
          <Stack spacing={0.25} minWidth={0}>
            <Typography variant="body2">{safe(row.original.preview?.title || row.original.type)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {safe(row.original.type)}
              {row.original.label ? ` · ${row.original.label}` : ''}
            </Typography>
          </Stack>
        )
      },
      {
        header: 'Source',
        accessorKey: 'source',
        cell: ({ row }) => {
          const creator = row.original.creator;
          const who = creator?.phone || creator?.name || creator?.email || '';
          return (
            <Stack spacing={0.25}>
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {safe(row.original.source)}
              </Typography>
              {who ? (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {who}
                </Typography>
              ) : null}
            </Stack>
          );
        }
      },
      {
        header: 'Shares',
        accessorKey: 'share_count',
        cell: ({ row }) => <Typography variant="body2">{Number(row.original.share_count) || 0}</Typography>
      },
      {
        header: 'Opens',
        accessorKey: 'open_count',
        cell: ({ row }) => <Typography variant="body2">{Number(row.original.open_count) || 0}</Typography>
      },
      {
        header: 'Status',
        accessorKey: 'record_status',
        cell: ({ row }) => <StatusChip value={row.original.record_status} />
      }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Share links"
      ariaLebel="Create link"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName="shareLink"
      totalCount={totalCount}
      topActionsLeft={topActionsLeft}
    />
  );
}
