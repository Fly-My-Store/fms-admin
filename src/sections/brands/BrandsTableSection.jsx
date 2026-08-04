'use client';

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';

function BrandLogo({ url, name }) {
  if (!url) {
    return (
      <Avatar variant="rounded" sx={{ width: 40, height: 40, fontSize: 14 }}>
        {(name || '?').slice(0, 1).toUpperCase()}
      </Avatar>
    );
  }
  return <Avatar src={url} alt={name || ''} variant="rounded" sx={{ width: 40, height: 40 }} />;
}

BrandLogo.propTypes = {
  url: PropTypes.string,
  name: PropTypes.string
};

export default function BrandsTableSection({
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
        header: 'Logo',
        accessorKey: 'logo_url',
        cell: ({ row }) => (
          <BrandLogo
            url={row.original.logo_thumb_url || row.original.logo_url}
            name={row.original.name}
          />
        )
      },
      { header: 'Name', accessorKey: 'name' },
      { header: 'Slug', accessorKey: 'slug' },
      {
        header: 'Record Status',
        accessorKey: 'record_status',
        cell: (cell) => {
          const value = cell.getValue();
          switch (value) {
            case TABLE_STATUS.ACTIVE:
              return <Chip color="success" label="Active" size="small" variant="light" />;
            case TABLE_STATUS.INACTIVE:
              return <Chip color="warning" label="Inactive" size="small" variant="light" />;
            case TABLE_STATUS.SUSPENDED:
              return <Chip color="error" label="Suspended" size="small" variant="light" />;
            case TABLE_STATUS.DELETED:
              return <Chip color="default" label="Deleted" size="small" variant="light" />;
            default:
              return <Chip color="default" label="Unknown" size="small" variant="light" />;
          }
        }
      }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      ariaLebel="Add Brand"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'brand'}
      totalCount={totalCount}
      topActionsLeft={topActionsLeft}
      topActions={topActions}
      showPagination={showPagination}
    />
  );
}

BrandsTableSection.propTypes = {
  rows: PropTypes.array,
  handleAddButton: PropTypes.func,
  handleEditButton: PropTypes.func,
  pageIndex: PropTypes.number,
  pageSize: PropTypes.number,
  totalPageCount: PropTypes.number,
  onPaginationChange: PropTypes.func,
  totalCount: PropTypes.number,
  topActionsLeft: PropTypes.func,
  topActions: PropTypes.func,
  showPagination: PropTypes.bool
};
