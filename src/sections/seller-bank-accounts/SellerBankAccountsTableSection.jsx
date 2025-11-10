'use client';

import { useMemo } from 'react';
import BasicReactTable from 'components/tables/basicTable';

export default function SellerBankAccountsTableSection({
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
      { header: 'Seller ID', accessorKey: 'seller_id' },
      { header: 'Account Holder', accessorKey: 'account_holder_name' },
      { header: 'Account No', accessorKey: 'account_number' },
      { header: 'IFSC', accessorKey: 'ifsc' },
      { header: 'Primary', accessorKey: 'is_primary' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Seller Bank Accounts"
      ariaLebel="Add Seller Bank Account"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'sellerBankAccount'}
    />
  );
}
