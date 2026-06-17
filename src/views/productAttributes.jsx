'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as attributes } from 'store/attributes/slice';
import ProductAttrsTableSection from 'sections/product-attributes/ProductAttrsTableSection';
import { useRouter } from 'next/navigation';
import { at } from 'lodash-es';
import { RECORD_STATUS } from 'utils/constants';
import { upsertProductAttr } from 'api/attributes';
import OutOfScopeAttributeNotice from 'components/OutOfScopeAttributeNotice';

export function ProductAttrsView({ product_id, productName, category_id }) {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.attributes || {});
  const list = state.productAttrs || { rows: [], count: 0, page: 1, pageSize: 10, totalPages: 1, loading: false, error: null };
  const { rows: data = [], count = 0, page = 1, pageSize = 10, totalPages = 1, error } = list;

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
    router.push(`/product-attrs/add?p=${product_id}&n=${encodeURIComponent(productName)}&c=${encodeURIComponent(category_id)}`);
  };

  const handleEditButton = (row) => {
    router.push(`/product-attrs/edit/${encodeURIComponent(row.attribute_code)}?p=${product_id}&n=${encodeURIComponent(productName)}&c=${encodeURIComponent(category_id)}`)
  };

  const handleDeleteButton = async (row) => {
    await upsertProductAttr(row.attribute_code, { product_id, record_status: RECORD_STATUS.ARCHIVED });
    enqueueSnackbar('Attribute updated', { variant: 'success' });
    dispatch(attributes.productAttrsListRequest({ params: { product_id, page, limit: pageSize } }));
  }

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
        handleDeleteButton={handleDeleteButton}
        totalCount={count}
      />
    </>
  );
}

export default ProductAttrsView;
