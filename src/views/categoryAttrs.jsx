'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as attributes } from 'store/attributes/slice';
import CategoryattrsTableSection from 'sections/categoryAttrs/CategoryattrsTableSection';
import CategoryattrsFormDialog from 'sections/categoryAttrs/CategoryattrsFormDialog';

export function CategoryattrsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.attributes || {});
  const list = state.categoryAttrs || { rows: [], count: 0, page: 1, pageSize: 10, totalPages: 1, loading: false, error: null };
  const { rows: data = [], count = 0, page = 1, pageSize = 10, totalPages = 1, error } = list;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const reload = () => {
    dispatch(attributes.categoryAttrsListRequest({ params: { page, limit: pageSize } }));
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelected(null);
  };

  const handleAddButton = () => {
    setSelected(null);
    setOpen(true);
  };

  const handleEditButton = (row) => {
    setSelected(row);
    setOpen(true);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(attributes.categoryAttrsListRequest({ params: { page: next.pageIndex + 1, limit: next.pageSize } }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  return (
    <>
      <CategoryattrsTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        totalCount={count}
      />
      <CategoryattrsFormDialog open={open} onClose={handleDialogToggle} initialData={selected} onSaved={reload} />
    </>
  );
}

export default CategoryattrsView;
