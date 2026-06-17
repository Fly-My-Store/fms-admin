'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, CircularProgress, Stack, Typography } from '@mui/material';
import OrdersTableSection from 'sections/orders/OrdersTableSection';
import { listOrders } from 'api/ordersPayments';

export default function EntityOrdersCard({ storeId, userId, title = 'Orders', showTitle = true }) {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!storeId && !userId) return;
    setLoading(true);
    setError(null);
    try {
      const params = { page: pageIndex + 1, limit: pageSize };
      if (storeId) params.store_id = storeId;
      if (userId) params.user_id = userId;
      const resp = await listOrders(params);
      const list = Array.isArray(resp?.data) ? resp.data : [];
      setRows(list);
      setTotalPages(resp?.meta?.totalPages || 1);
      setTotalCount(resp?.meta?.total ?? list.length);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load orders');
      setRows([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, storeId, userId]);

  useEffect(() => {
    setPageIndex(0);
  }, [storeId, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
    setPageIndex(next.pageIndex);
  };

  const topActions = useCallback(() => {
    const href = storeId ? `/orders?store_id=${storeId}` : userId ? `/orders?user_id=${userId}` : '/orders';
    return (
      <Typography component={Link} href={href} variant="body2" color="primary">
        All orders
      </Typography>
    );
  }, [storeId, userId]);

  if (!storeId && !userId) return null;

  if (loading && rows.length === 0) {
    return (
      <Stack alignItems="center" py={3}>
        <CircularProgress size={24} />
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <OrdersTableSection
      rows={rows}
      title={title}
      showTitle={showTitle}
      handleViewButton={(row) => row?.id && router.push(`/orders/${row.id}`)}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPages}
      totalCount={totalCount}
      onPaginationChange={handlePaginationChange}
      hideStoreColumn={Boolean(userId && !storeId)}
      hideCustomerColumn={Boolean(storeId && !userId)}
      topActions={topActions}
    />
  );
}

EntityOrdersCard.propTypes = {
  storeId: PropTypes.string,
  userId: PropTypes.string,
  title: PropTypes.string,
  showTitle: PropTypes.bool
};
