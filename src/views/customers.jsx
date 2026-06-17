'use client';

import { useRouter } from 'next/navigation';
import CustomersTableSection from 'sections/customers/CustomersTableSection';
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';

export default function CustomersView() {
  const router = useRouter();

  const { rows, pageIndex, pageSize, totalPages, handlePaginationChange } = useAxiosPaginatedList(
    'admin/iam/users',
    { params: { type: 'CUSTOMER' } }
  );

  const handleEditButton = (row) => {
    if (!row?.id) return;
    router.push(`/customers/edit/${row.id}`);
  };

  const handleViewButton = (row) => {
    if (!row?.id) return;
    router.push(`/customers/${row.id}`);
  };

  return (
    <CustomersTableSection
      rows={rows}
      handleEditButton={handleEditButton}
      handleViewButton={handleViewButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPages}
      onPaginationChange={handlePaginationChange}
    />
  );
}
