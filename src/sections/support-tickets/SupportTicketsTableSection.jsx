'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function SupportTicketsTableSection({
  rows,
  handleViewButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange
}) {
  const columns = useMemo(
    () => [
      { header: 'Subject', accessorKey: 'subject' },
      { header: 'Requester', accessorKey: 'requester_label' },
      { header: 'Type', accessorKey: 'requester_type' },
      { header: 'Category', accessorKey: 'category_label' },
      { header: 'Status', accessorKey: 'status' },
      { header: 'Created', accessorKey: 'created_at' }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Support Tickets"
      ariaLebel="View Support Ticket"
      handleViewButton={handleViewButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName="order"
    />
  );
}
