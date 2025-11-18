'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as catalog } from 'store/catalog/slice';
import CategoriesTableSection from 'sections/categories/CategoriesTableSection';
import { useRouter } from 'next/navigation';
import { Button, IconButton } from '@mui/material';
import CategoriesFilters from 'sections/categories/CategoriesFilters';
import { DownloadOutlined, PlusSquareOutlined } from '@ant-design/icons';

export function CategoriesView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const state = useSelector((s) => s.catalog || {});
  const list = state.categories || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1, total: 0 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1, total = 0 } = {}, error } = list;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // ---- filters ----
  const [filters, setFilters] = useState({ parent: null, status: '', record_status: '' });

  // mount: initial fetch
  useEffect(() => {
    dispatch(
      catalog.categoriesListRequest({ params: { page, limit: pageSize } })
    );
  }, [dispatch]);

  // refetch when filters change → reset to page 1
  useEffect(() => {
    const payload = {
      page: 1,
      limit: pageSize,
      parent_id: filters.parent?.id || undefined,
      status: filters.status || undefined,
      record_status: filters.record_status || undefined
    };
    dispatch(catalog.categoriesListRequest({ params: payload }));
  }, [filters, dispatch]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelected(null);
  };

  const handleAddButton = () => {
    router.push('/categories/create');
  };

  const handleAddInCategoryButton = (row) => {
    const parentName = encodeURIComponent(row?.name || '');
    router.push(`/categories/create?parent_id=${row.id}&parent_name=${parentName}`);
  };

  const handleEditButton = (row) => {
    router.push(`/categories/edit/${row.id}`);
  };
  const handleViewButton = (row) => {
    router.push(`/categories/${row.id}`);
  }

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    const payload = {
      page: next.pageIndex + 1,
      limit: next.pageSize,
      parent_id: filters.parent?.id || undefined,
      status: filters.status || undefined,
      record_status: filters.record_status || undefined
    };
    dispatch(catalog.categoriesListRequest({ params: payload }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  const topActionsLeft = (row) => {
    return (
      <>
        <CategoriesFilters
          value={filters}
          onChange={setFilters}
        />
      </>
    );
  };

  const tableActions = (row) => {
    return (
      <>
        <IconButton onClick={() => handleAddInCategoryButton(row)}>
          <PlusSquareOutlined />
        </IconButton>
      </>
    );
  };

  return (
    <>
      <CategoriesTableSection
        topActionsLeft={topActionsLeft}
        tableActions={tableActions}
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        handleViewButton={handleViewButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        totalCount={total}
        onPaginationChange={handlePaginationChange}
      />
    </>
  );
}

export default CategoriesView;
