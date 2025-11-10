'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function AuditsTableSection({
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
      { header: 'Actor', accessorKey: 'actor_id' },
      { header: 'Entity', accessorKey: 'entity' },
      { header: 'Action', accessorKey: 'action' },
      { header: 'At', accessorKey: 'created_at' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Audit Logs"
      ariaLebel="Add Audit Log"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'audit'}
    />
  );
}
