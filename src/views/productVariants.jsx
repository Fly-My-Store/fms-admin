'use client';

import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import ProductVariantsGrid from 'sections/product-variants/ProductVariantsGrid';
import { actions as catalog } from 'store/catalog/slice';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export default function ProductVariantsView({ product_id, productName }) {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.catalog || {});
  const list = state.variants || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1, total: 0 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1, total = 0 } = {}, error } = list;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const router = useRouter();

  useEffect(() => {
    dispatch(catalog.variantsListRequest({ params: { product_id, page, limit: pageSize } }));
  }, [dispatch]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelected(null);
  };

  const handleAddButton = () => {
    router.push(`/product-variants/add?p=${product_id}&n=${encodeURIComponent(productName)}`);
  };

  const handleEditButton = (row) => {
    router.push(`/product-variants/edit/${row.id}?p=${product_id}&n=${encodeURIComponent(productName)}`)
  };

  const handleViewButton = (row) => {
    router.push(`/product-variants/${row.id}?p=${product_id}&n=${encodeURIComponent(productName)}`)
  }

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(catalog.variantsListRequest({ params: { product_id, page: next.pageIndex + 1, limit: next.pageSize } }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  return (
    <>
      <ProductVariantsGrid
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        handleViewButton={handleViewButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        totalCount={total}
      />
    </>
  );
}
