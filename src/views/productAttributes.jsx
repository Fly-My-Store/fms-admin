'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as attributes } from 'store/attributes/slice';
import ProductAttrsTableSection from 'sections/product-attributes/ProductAttrsTableSection';
import { useRouter } from 'next/navigation';

export function ProductAttrsView({ product_id, productName }) {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.attributes || {});
  const list = state.productAttrs || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const router = useRouter();

  useEffect(() => {
    dispatch(attributes.productAttrsListRequest({ params: { product_id, page, limit: pageSize } }));
  }, [dispatch]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelected(null);
  };

  const handleAddButton = () => {
    router.push(`/product-attrs/add?p=${product_id}&n=${encodeURIComponent(productName)}`);
  };

  const handleEditButton = (row) => {
    router.push(`/product-attrs/edit/${encodeURIComponent(row.attribute_code)}?p=${product_id}&n=${encodeURIComponent(productName)}`)
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(attributes.productAttrsListRequest({ params: { product_id, page: next.pageIndex + 1, limit: next.pageSize } }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  return (
    <>
      <ProductAttrsTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        handleViewButton={(row) => router.push(`/products/${row.id}`)}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
}

export default ProductAttrsView;
