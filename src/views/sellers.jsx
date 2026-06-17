'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { actions as sellersStores } from 'store/sellersStores/slice';
import SellersTableSection from 'sections/sellers/SellersTableSection';

export function SellersView() {
  const dispatch = useDispatch();
  const router = useRouter();
  const state = useSelector((s) => s.sellersStores || {});
  const list = state.sellers || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  useEffect(() => {
    dispatch(sellersStores.sellersListRequest({ params: { page, limit: pageSize } }));
  }, [dispatch]);

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(sellersStores.sellersListRequest({ params: { page: next.pageIndex + 1, limit: next.pageSize } }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  const handlePayoutButton = (row) => {
    const name = row?.display_name || row?.legal_name || '';
    router.push(
      `/payouts?payee_type=SELLER&payee_id=${row.id}&payee_name=${encodeURIComponent(name)}`
    );
  };

  const handleViewStoreButton = (row) => {
    const storeId =
      row?.primary_store_id || row?.default_store_id || row?.primary_store?.id || row?.stores?.[0]?.id;
    if (storeId) router.push(`/stores/${storeId}`);
  };

  return (
    <SellersTableSection
      rows={data}
      handleViewStoreButton={handleViewStoreButton}
      handlePayoutButton={handlePayoutButton}
      pageIndex={page - 1}
      pageSize={pageSize}
      totalPageCount={totalPages}
      onPaginationChange={handlePaginationChange}
    />
  );
}

export default SellersView;
