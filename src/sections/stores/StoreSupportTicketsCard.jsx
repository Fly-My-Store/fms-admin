'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, CircularProgress, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import SupportTicketsTableSection from 'sections/support-tickets/SupportTicketsTableSection';
import { listSupportTickets } from 'api/support';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
};

export default function StoreSupportTicketsCard({ storeId, sellerUserId, userId, hideRequesterColumn, showTableTitle = true }) {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const effectiveUserId = userId || sellerUserId;

  const filterParams = useMemo(() => {
    const params = {};
    if (storeId) params.store_id = storeId;
    if (effectiveUserId) params.user_id = effectiveUserId;
    return params;
  }, [effectiveUserId, storeId]);

  const load = useCallback(async () => {
    if (!storeId && !effectiveUserId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await listSupportTickets({
        page: pageIndex + 1,
        limit: pageSize,
        ...filterParams
      });
      const list = Array.isArray(resp?.data) ? resp.data : [];
      setRows(
        list.map((row) => ({
          ...row,
          requester_label: row.requester?.name || row.requester?.phone || row.requester?.email || '—',
          category_label: row.category_label || row.category,
          created_at: formatDate(row.created_at)
        }))
      );
      setTotalPages(resp?.meta?.totalPages || 1);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load support tickets');
      setRows([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filterParams, pageIndex, pageSize, effectiveUserId, storeId]);

  useEffect(() => {
    setPageIndex(0);
  }, [storeId, effectiveUserId]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
    setPageIndex(next.pageIndex);
  };

  if (!storeId && !effectiveUserId) return null;

  return (
    < >
      {loading && (
        <Stack alignItems="center" py={2}>
          <CircularProgress size={24} />
        </Stack>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <SupportTicketsTableSection
          rows={rows}
          handleViewButton={(row) => row?.id && router.push(`/support-tickets/${row.id}`)}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalPageCount={totalPages}
          onPaginationChange={handlePaginationChange}
          hideRequesterColumn={hideRequesterColumn || Boolean(effectiveUserId && !storeId)}
          showTitle={showTableTitle}
          topActionsLeft={() => (
            <Typography component={Link} href="/support-tickets" variant="body2" color="primary">
              All tickets
            </Typography>
          )}
        />
      )}
    </>
  );
}

StoreSupportTicketsCard.propTypes = {
  storeId: PropTypes.string,
  sellerUserId: PropTypes.string,
  userId: PropTypes.string,
  hideRequesterColumn: PropTypes.bool,
  showTableTitle: PropTypes.bool
};
