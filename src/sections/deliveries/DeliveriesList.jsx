'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Alert, Chip, Stack, Typography } from '@mui/material';
import BasicReactTable from 'components/tables/basicTable';
import { listDeliveries } from 'api/logistics';
import { formatINR } from 'utils/currency';
import {
  expectedShareCents,
  formatDeliveryDate,
  isCreditedToWallet,
  normalizeDeliveryRow,
  shortOrderId,
  walletShareCents
} from './deliveryUtils';

function DeliveryStatusChip({ value }) {
  if (!value) return null;
  const color =
    value === 'DELIVERED' ? 'success' : value === 'CANCELLED' || value === 'FAILED' ? 'error' : 'default';
  return <Chip size="small" color={color} label={value} variant="light" />;
}

function WalletStatusChip({ row }) {
  const share = expectedShareCents(row);
  if (row.status !== 'DELIVERED' || share <= 0) return '—';
  const credited = isCreditedToWallet(row);
  return (
    <Chip
      size="small"
      color={credited ? 'success' : 'warning'}
      label={credited ? 'Credited' : 'Pending'}
      variant="outlined"
    />
  );
}

function RiderDeliveriesSubheader({ rows, uncreditedCount, totalCount }) {
  const deliveredRows = rows.filter((row) => row.status === 'DELIVERED');
  const totalExpectedShare = deliveredRows.reduce((sum, row) => sum + expectedShareCents(row), 0);
  const totalWalletShare = deliveredRows.reduce((sum, row) => sum + walletShareCents(row), 0);

  return (
    <Stack spacing={1.5} sx={{ width: '100%' }}>
      {totalCount > 0 && deliveredRows.length > 0 && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
          <Typography variant="body2" color="text.secondary">
            Rider share on this page: {formatINR(totalExpectedShare)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            In wallet (this page): {formatINR(totalWalletShare)}
          </Typography>
        </Stack>
      )}
      {uncreditedCount > 0 && (
        <Alert severity="warning">
          {uncreditedCount} delivered order{uncreditedCount === 1 ? '' : 's'} on this page still syncing to the rider
          wallet.
        </Alert>
      )}
    </Stack>
  );
}

RiderDeliveriesSubheader.propTypes = {
  rows: PropTypes.array,
  uncreditedCount: PropTypes.number,
  totalCount: PropTypes.number
};

export default function DeliveriesList({
  filters = {},
  variant = 'page',
  pageSize: initialPageSize = 20,
  onEdit,
  onLoaded,
  refreshKey,
  title = 'Deliveries',
  showTitle = true
}) {
  const [rows, setRows] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);
  const parsedFilters = useMemo(() => JSON.parse(filterKey), [filterKey]);
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;

  const load = useCallback(
    async (page, limit) => {
      const params = {
        page,
        limit,
        ...(parsedFilters.q ? { q: parsedFilters.q } : {}),
        ...(parsedFilters.status ? { status: parsedFilters.status } : {}),
        ...(parsedFilters.rider_id ? { rider_id: parsedFilters.rider_id } : {}),
        ...(parsedFilters.order_id ? { order_id: parsedFilters.order_id } : {})
      };

      try {
        setError(null);
        const resp = await listDeliveries(params);
        const list = Array.isArray(resp?.data) ? resp.data : [];
        const normalized = list.map(normalizeDeliveryRow);
        setRows(normalized);
        setTotalPages(resp?.meta?.totalPages || 1);
        setTotalCount(resp?.meta?.total ?? normalized.length);
        onLoadedRef.current?.(normalized, resp?.meta);
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load deliveries');
        setRows([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    },
    [parsedFilters]
  );

  useEffect(() => {
    setPageIndex(0);
  }, [filterKey, refreshKey]);

  useEffect(() => {
    load(pageIndex + 1, pageSize);
  }, [pageIndex, pageSize, filterKey, refreshKey, load]);

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
    setPageIndex(next.pageIndex);
    setPageSize(next.pageSize);
  };

  const pageColumns = useMemo(
    () => [
      { header: 'Order', accessorKey: 'order_label' },
      { header: 'Store', accessorKey: 'store_name' },
      { header: 'Rider', accessorKey: 'rider_name' },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => <DeliveryStatusChip value={getValue()} />
      },
      {
        header: 'Updated',
        accessorFn: (row) => formatDeliveryDate(row.updated_at || row.created_at)
      }
    ],
    []
  );

  const riderColumns = useMemo(
    () => [
      {
        header: 'Order',
        id: 'order',
        cell: ({ row }) =>
          row.original.order_id ? (
            <Typography
              component={Link}
              href={`/orders/${row.original.order_id}`}
              variant="body2"
              color="primary"
              sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {shortOrderId(row.original.order_id)}
            </Typography>
          ) : (
            '—'
          )
      },
      { header: 'Store', accessorKey: 'store_name' },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => <DeliveryStatusChip value={getValue()} />
      },
      {
        header: 'Rider share',
        id: 'rider_share',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const share = expectedShareCents(row.original);
          return share > 0 ? formatINR(share) : '—';
        }
      },
      {
        header: 'Wallet',
        id: 'wallet',
        cell: ({ row }) => <WalletStatusChip row={row.original} />
      },
      {
        header: 'Updated',
        accessorFn: (row) => formatDeliveryDate(row.updated_at || row.created_at)
      }
    ],
    []
  );

  const uncreditedCount = useMemo(
    () =>
      rows.filter(
        (row) => row.status === 'DELIVERED' && expectedShareCents(row) > 0 && !isCreditedToWallet(row)
      ).length,
    [rows]
  );

  const isRiderVariant = variant === 'rider';

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      <BasicReactTable
        columns={isRiderVariant ? riderColumns : pageColumns}
        data={rows}
        title={title}
        showTitle={showTitle}
        showActions={!isRiderVariant && Boolean(onEdit)}
        handleEditButton={onEdit}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalPageCount={totalPages}
        totalCount={totalCount}
        onPaginationChange={handlePaginationChange}
        permissionName="deliveryJob"
        subheader={
          isRiderVariant
            ? () => (
                <RiderDeliveriesSubheader rows={rows} uncreditedCount={uncreditedCount} totalCount={totalCount} />
              )
            : undefined
        }
      />
    </Stack>
  );
}

DeliveriesList.propTypes = {
  filters: PropTypes.shape({
    q: PropTypes.string,
    status: PropTypes.string,
    rider_id: PropTypes.string,
    order_id: PropTypes.string
  }),
  variant: PropTypes.oneOf(['page', 'rider']),
  pageSize: PropTypes.number,
  onEdit: PropTypes.func,
  onLoaded: PropTypes.func,
  refreshKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  title: PropTypes.string,
  showTitle: PropTypes.bool
};
