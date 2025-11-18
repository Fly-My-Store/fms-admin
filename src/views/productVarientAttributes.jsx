'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as attributes } from 'store/attributes/slice';
import VariantAttrsTableSection from 'sections/variant-attributes/VariantAttrsTableSection';
import { useRouter } from 'next/navigation';

export function ProductVarientAttrsView({ variant_id, variantName, category_id }) {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.attributes || {});
  const list = state.variantAttrs || { rows: [], count: 0, page: 1, pageSize: 10, totalPages: 1, loading: false, error: null };
  const { rows: data = [], count = 0, page = 1, pageSize = 10, totalPages = 1, error } = list;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const router = useRouter();

  useEffect(() => {
    dispatch(attributes.variantAttrsListRequest({ params: { variant_id, page, limit: pageSize } }));
  }, [dispatch]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelected(null);
  };

  const handleAddButton = () => {
    router.push(`/variant-attrs/add?v=${variant_id}&n=${encodeURIComponent(variantName)}&c=${encodeURIComponent(category_id)}`);
  };

  const handleEditButton = (row) => {
    router.push(`/variant-attrs/edit/${encodeURIComponent(row.attribute_code)}?v=${variant_id}&n=${encodeURIComponent(variantName)}&c=${encodeURIComponent(category_id)}`)
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(attributes.variantAttrsListRequest({ params: { variant_id, page: next.pageIndex + 1, limit: next.pageSize } }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  return (
    <>
      <VariantAttrsTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        handleViewButton={(row) => router.push(`/variant/${row.id}`)}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        totalCount={count}
      />
    </>
  );
}

export default ProductVarientAttrsView;
