'use client';

import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import BasicReactTable from 'components/tables/basicTable';
import { RECORD_STATUS } from 'utils/constants';

const nfINR = new Intl.NumberFormat('en-IN');

function fmtMoney(n) {
  if (n == null || n === '') return '—';
  const num = Number(n);
  if (Number.isNaN(num)) return '—';
  return `₹${nfINR.format(num)}`;
}

function getFirstImage(row) {
  const imgs = Array.isArray(row?.images) ? row.images : [];
  if (!imgs.length) return null;
  const primary = imgs.find((i) => i?.is_primary) || imgs[0];
  return primary?.thumb_url || primary?.url || null;
}

function getOptionSummary(row) {
  if (row?.option_summary) return String(row.option_summary);
  const attrs = row?.attributes || {};
  if (attrs && typeof attrs === 'object' && !Array.isArray(attrs)) {
    const parts = Object.keys(attrs).map((k) => `${k}: ${attrs[k]}`);
    if (parts.length) return parts.join(' · ');
  }
  return '—';
}

function VariantThumb({ url, name }) {
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

VariantThumb.propTypes = {
  url: PropTypes.string,
  name: PropTypes.string
};

export default function ProductVariantsTableSection({
  rows = [],
  handleAddButton,
  handleEditButton,
  handleViewButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange,
  totalCount,
  topActionsLeft,
  topActions,
  showProductMeta = false,
  showPagination = true,
  showTitle = true,
  title
}) {
  const columns = useMemo(
    () => [
      {
        header: 'Image',
        id: 'image',
        cell: ({ row }) => (
          <VariantThumb url={getFirstImage(row.original)} name={row.original?.sku} />
        )
      },
      { header: 'SKU', accessorKey: 'sku' },
      ...(showProductMeta
        ? [
            {
              header: 'Product',
              accessorFn: (row) => row?.product?.name || '',
              cell: ({ row }) => row.original?.product?.name || '—'
            }
          ]
        : []),
      {
        header: 'Options',
        id: 'options',
        cell: ({ row }) => (
          <Typography variant="body2" noWrap title={getOptionSummary(row.original)}>
            {getOptionSummary(row.original)}
          </Typography>
        )
      },
      {
        header: 'Price',
        accessorKey: 'sale_price',
        cell: ({ row }) => fmtMoney(row.original?.sale_price)
      },
      {
        header: 'MRP',
        accessorKey: 'mrp',
        cell: ({ row }) => fmtMoney(row.original?.mrp)
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
    [showProductMeta]
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      ariaLebel="Add Variant"
      handleAddButton={handleAddButton}
      handleViewButton={handleViewButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName="product"
      totalCount={totalCount}
      topActionsLeft={topActionsLeft}
      topActions={topActions}
      showPagination={showPagination}
      showTitle={showTitle}
      title={title}
    />
  );
}

ProductVariantsTableSection.propTypes = {
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
  topActions: PropTypes.func,
  showProductMeta: PropTypes.bool,
  showPagination: PropTypes.bool,
  showTitle: PropTypes.bool,
  title: PropTypes.string
};
