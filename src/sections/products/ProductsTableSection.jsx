'use client';

import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinkMui from '@mui/material/Link';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BasicReactTable from 'components/tables/basicTable';
import { RECORD_STATUS } from 'utils/constants';

function ProductThumb({ url, name }) {
  const [anchorEl, setAnchorEl] = useState(null);

  if (!url) {
    return (
      <Avatar variant="rounded" sx={{ width: 40, height: 40, fontSize: 14 }}>
        {(name || '?').slice(0, 1).toUpperCase()}
      </Avatar>
    );
  }

  const open = Boolean(anchorEl);

  return (
    <Box
      onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
      onMouseLeave={() => setAnchorEl(null)}
      sx={{ display: 'inline-flex', cursor: 'zoom-in' }}
    >
      <Avatar src={url} alt={name || ''} variant="rounded" sx={{ width: 40, height: 40 }} />
      <Popover
        open={open}
        anchorEl={anchorEl}
        sx={{ pointerEvents: 'none' }}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: {
              p: 0.5,
              overflow: 'hidden',
              boxShadow: 6
            }
          }
        }}
      >
        <Box
          component="img"
          src={url}
          alt={name || ''}
          sx={{
            display: 'block',
            maxWidth: 280,
            maxHeight: 280,
            width: 'auto',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      </Popover>
    </Box>
  );
}

ProductThumb.propTypes = {
  url: PropTypes.string,
  name: PropTypes.string
};

function CategoryCell({ category }) {
  if (!category?.id) return '—';

  const parent = category.parent;
  return (
    <Typography component="span" variant="body2" sx={{ display: 'inline-flex', flexWrap: 'wrap', gap: 0.5 }}>
      <LinkMui
        component={Link}
        href={`/categories/${category.id}`}
        underline="hover"
        onClick={(e) => e.stopPropagation()}
      >
        {category.name}
      </LinkMui>
      {parent?.id ? (
        <>
          <Typography component="span" color="text.secondary">
            (
          </Typography>
          <LinkMui
            component={Link}
            href={`/categories/${parent.id}`}
            underline="hover"
            color="text.secondary"
            onClick={(e) => e.stopPropagation()}
          >
            {parent.name}
          </LinkMui>
          <Typography component="span" color="text.secondary">
            )
          </Typography>
        </>
      ) : null}
    </Typography>
  );
}

CategoryCell.propTypes = {
  category: PropTypes.object
};

export default function ProductsTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  handleViewButton,
  totalCount,
  topActionsLeft,
  topActions
}) {
  const columns = useMemo(
    () => [
      {
        header: 'Image',
        id: 'image',
        cell: ({ row }) => {
          const img = row.original?.images?.[0];
          return <ProductThumb url={img?.url} name={row.original?.name} />;
        }
      },
      { header: 'Name', accessorKey: 'name' },
      { header: 'Slug', accessorKey: 'slug' },
      {
        header: 'Brand',
        accessorFn: (row) => row?.brand?.name || '',
        cell: ({ row }) => {
          const brand = row?.original?.brand;
          if (!brand) return '—';
          return (
            <Stack direction="row" alignItems="center" spacing={1}>
              {brand.logo_url ? <Avatar src={brand.logo_url} sx={{ width: 22, height: 22 }} /> : null}
              <span>{brand.name}</span>
            </Stack>
          );
        }
      },
      {
        header: 'Category',
        accessorFn: (row) => row?.category?.name || '',
        cell: ({ row }) => <CategoryCell category={row?.original?.category} />
      },
      {
        header: 'Variants',
        accessorKey: 'variant_count',
        cell: ({ row }) => Number(row.original?.variant_count ?? 0)
      },
      {
        header: 'Rating',
        accessorFn: (row) => row?.rating ?? 0,
        cell: ({ row }) => {
          const r = Number(row?.original?.rating ?? 0);
          const c = Number(row?.original?.rating_count ?? 0);
          return `${Number.isFinite(r) ? r.toFixed(2) : r} (${c})`;
        }
      },
      {
        header: 'Status',
        accessorKey: 'record_status',
        cell: (cell) => {
          const value = cell.getValue();
          switch (value) {
            case RECORD_STATUS.ACTIVE:
              return <Chip color="success" label="Active" size="small" variant="light" />;
            case RECORD_STATUS.INACTIVE:
              return <Chip color="warning" label="Inactive" size="small" variant="light" />;
            case RECORD_STATUS.ARCHIVED:
              return <Chip color="default" label="Archived" size="small" variant="light" />;
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
      ariaLebel="Add Product"
      handleAddButton={handleAddButton}
      handleViewButton={handleViewButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'product'}
      totalCount={totalCount}
      topActionsLeft={topActionsLeft}
      topActions={topActions}
    />
  );
}

ProductsTableSection.propTypes = {
  rows: PropTypes.array,
  handleAddButton: PropTypes.func,
  handleEditButton: PropTypes.func,
  handleViewButton: PropTypes.func,
  pageIndex: PropTypes.number,
  pageSize: PropTypes.number,
  totalPageCount: PropTypes.number,
  onPaginationChange: PropTypes.func,
  totalCount: PropTypes.number,
  topActionsLeft: PropTypes.func,
  topActions: PropTypes.func
};
