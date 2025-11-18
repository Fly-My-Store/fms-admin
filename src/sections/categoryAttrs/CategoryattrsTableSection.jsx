'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

export default function CategoryattrsTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  totalCount
}) {
  const columns = useMemo(
    () => [
      { header: 'Category ID', accessorKey: 'category_id' },
      {
        header: 'Category',
        accessorKey: 'category',
        cell: (cell) => {
          const parent = cell.getValue(); // expects object { id, name } from API include
          return <span >{parent?.name}</span>;
        }
      },
      { header: 'Attribute Code', accessorKey: 'attribute_code' },
      { header: 'Required', accessorKey: 'is_required' },
      { header: 'Filterable', accessorKey: 'is_filterable' },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Category Attributes"
      ariaLebel="Add Category Attribute"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'categoryAttr'}
      totalCount={totalCount}
    />
  );
}
