'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function SupportTicketsTableSection({
  rows,
  handleViewButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  topActionsLeft,
  hideRequesterColumn = false,
  showTitle = true
}) {
  const columns = useMemo(
    () => {
      const cols = [
      { header: 'Subject', accessorKey: 'subject' },
      { header: 'Requester', accessorKey: 'requester_label' },
      { header: 'Role', accessorKey: 'requester_type' },
      { header: 'Category', accessorKey: 'category_label' },
      { header: 'Status', accessorKey: 'status' },
      { header: 'Created', accessorKey: 'created_at' }
    ];
      return hideRequesterColumn ? cols.filter((c) => c.accessorKey !== 'requester_label' && c.accessorKey !== 'requester_type') : cols;
    },
    [hideRequesterColumn]
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Support Tickets"
      showTitle={showTitle}
      ariaLebel="View Support Ticket"
      handleViewButton={handleViewButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      topActionsLeft={topActionsLeft}
    />
  );
}
