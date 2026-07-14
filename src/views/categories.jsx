'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as catalog } from 'store/catalog/slice';
import CategoriesTableSection from 'sections/categories/CategoriesTableSection';
import { useRouter } from 'next/navigation';
import { IconButton } from '@mui/material';
import CategoriesFilters from 'sections/categories/CategoriesFilters';
import { PlusSquareOutlined } from '@ant-design/icons';

export function CategoriesView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const state = useSelector((s) => s.catalog || {});
  const list = state.categories || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1, total: 0 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1, total = 0 } = {}, error } = list;

  const [filters, setFilters] = useState({ parent: null, record_status: '', q: '' });
  const [debouncedQ, setDebouncedQ] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ((filters.q || '').trim()), 300);
    return () => clearTimeout(t);
  }, [filters.q]);

  const buildParams = (pageNum = page, limit = pageSize) => ({
    page: pageNum,
    limit,
    ...(filters.parent?.id ? { parent_id: filters.parent.id } : {}),
    ...(filters.record_status !== '' && filters.record_status != null
      ? { record_status: filters.record_status }
      : {}),
    ...(debouncedQ ? { q: debouncedQ } : {})
  });

  useEffect(() => {
    dispatch(catalog.categoriesListRequest({ params: buildParams(1, pageSize) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters.parent?.id, filters.record_status, debouncedQ]);

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
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(
      catalog.categoriesListRequest({
        params: buildParams(next.pageIndex + 1, next.pageSize)
      })
    );
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  const topActionsLeft = () => (
    <CategoriesFilters value={filters} onChange={setFilters} />
  );

  const tableActions = (row) => (
    <IconButton onClick={() => handleAddInCategoryButton(row)}>
      <PlusSquareOutlined />
    </IconButton>
  );

  return (
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
  );
}

export default CategoriesView;
