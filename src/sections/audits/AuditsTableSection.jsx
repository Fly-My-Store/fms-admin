'use client';

import { useMemo } from 'react';
import Typography from '@mui/material/Typography';
import BasicReactTable from 'components/tables/basicTable';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

const shortId = (id) => (id ? String(id).slice(0, 8) : '—');

export default function AuditsTableSection({ rows, pageIndex, pageSize, totalPageCount, onPaginationChange }) {
  const columns = useMemo(
    () => [
      {
        header: 'Actor',
        accessorKey: 'actor_user_id',
        cell: ({ row }) => (
          <Typography variant="body2" fontFamily="monospace" title={row.original.actor_user_id}>
            {shortId(row.original.actor_user_id)}
          </Typography>
        )
      },
      {
        header: 'Entity',
        id: 'entity',
        cell: ({ row }) => {
          const type = row.original.entity_type || '—';
          const id = row.original.entity_id ? shortId(row.original.entity_id) : '';
          return id ? `${type} · ${id}` : type;
        }
      },
      { header: 'Action', accessorKey: 'action' },
      {
        header: 'At',
        accessorKey: 'created_at',
        cell: ({ row }) => formatDate(row.original.created_at || row.original.createdAt)
      }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Audit Logs"
      showActions={false}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName="auditLog"
    />
  );
}
