'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Alert, CircularProgress, Stack, Typography } from '@mui/material';
import CartsTableSection from 'sections/carts/CartsTableSection';
import { listCarts } from 'api/ordersPayments';

export default function CustomerCartsCard({ userId, showTitle = true }) {
  const [rows, setRows] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await listCarts({ page: pageIndex + 1, limit: pageSize, user_id: userId });
      const list = Array.isArray(resp?.data) ? resp.data : [];
      setRows(list);
      setTotalPages(resp?.meta?.totalPages || 1);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load carts');
      setRows([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, userId]);

  useEffect(() => {
    setPageIndex(0);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!userId) return null;

  if (loading && rows.length === 0) {
    return (
      <Stack alignItems="center" py={3}>
        <CircularProgress size={24} />
      </Stack>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <CartsTableSection
      rows={rows}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPages}
      onPaginationChange={(updater) => {
        const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
        setPageIndex(next.pageIndex);
      }}
      hideCustomerColumn
      showActions={false}
      showTitle={showTitle}
      topActionsLeft={() => (
        <Typography component={Link} href="/carts" variant="body2" color="primary">
          All carts
        </Typography>
      )}
    />
  );
}

CustomerCartsCard.propTypes = {
  userId: PropTypes.string
};
