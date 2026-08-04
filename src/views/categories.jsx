'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as catalog } from 'store/catalog/slice';
import CategoriesTableSection from 'sections/categories/CategoriesTableSection';
import CategoriesBulkUploadDialog from 'sections/categories/CategoriesBulkUploadDialog';
import CategoriesFilters from 'sections/categories/CategoriesFilters';
import { useRouter } from 'next/navigation';
import { Button, IconButton, Stack } from '@mui/material';
import { PlusSquareOutlined } from '@ant-design/icons';
import useUrlFilters from 'hooks/useUrlFilters';
import { getCategory } from 'api/catalog';
import { RECORD_STATUS } from 'utils/constants';

const DEFAULT_PAGE_SIZE = 20;

const FILTER_DEFAULTS = {
  q: '',
  record_status: String(RECORD_STATUS.ACTIVE),
  parent_id: '',
  level: '',
  sort: 'name',
  dir: 'ASC',
  page: 1,
  limit: DEFAULT_PAGE_SIZE
};

export function CategoriesView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const state = useSelector((s) => s.catalog || {});
  const list = state.categories || {
    rows: [],
    meta: { page: 1, pageSize: DEFAULT_PAGE_SIZE, totalPages: 1, total: 0 },
    loading: false,
    error: null
  };
  const {
    rows: data = [],
    meta: { totalPages = 1, total = 0 } = {},
    error
  } = list;

  const [bulkOpen, setBulkOpen] = useState(false);
  const { draft, setDraft, applied, applySearch, handlePaginationChange, urlKey } = useUrlFilters({
    defaults: FILTER_DEFAULTS
  });
  const [parentSel, setParentSel] = useState(null);

  const filterUi = {
    q: draft.q || '',
    record_status: draft.record_status === '' ? '' : Number(draft.record_status) || draft.record_status,
    level: draft.level || '',
    sort: draft.sort || 'name',
    dir: draft.dir || 'ASC',
    parent: parentSel
  };

  const onFilterUiChange = (next) => {
    setParentSel(next.parent || null);
    setDraft({
      q: next.q ?? '',
      record_status: next.record_status === '' || next.record_status == null ? '' : String(next.record_status),
      level: next.level || '',
      sort: next.sort || 'name',
      dir: next.dir || (next.sort === 'name' || next.sort === 'slug' ? 'ASC' : 'DESC'),
      parent_id: next.parent?.id || ''
    });
  };

  const buildParams = (f = applied) => ({
    page: Number(f.page) || 1,
    limit: Number(f.limit) || DEFAULT_PAGE_SIZE,
    sort: f.sort || 'name',
    dir: f.dir || 'ASC',
    ...(f.parent_id ? { parent_id: f.parent_id } : {}),
    ...(f.level ? { level: f.level } : {}),
    ...(f.record_status !== '' && f.record_status != null ? { record_status: f.record_status } : {}),
    ...(f.q ? { q: f.q } : {})
  });

  useEffect(() => {
    dispatch(catalog.categoriesListRequest({ params: buildParams(applied) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, urlKey, applied.page, applied.limit, applied.q, applied.record_status, applied.parent_id, applied.level, applied.sort, applied.dir]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!applied.parent_id) {
        setParentSel(null);
        return;
      }
      try {
        const res = await getCategory(applied.parent_id);
        if (!cancelled) setParentSel(res?.data || res || null);
      } catch {
        if (!cancelled) setParentSel(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applied.parent_id]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const handleSearch = () => {
    applySearch({
      q: (draft.q || '').trim(),
      record_status: draft.record_status,
      parent_id: parentSel?.id || '',
      level: draft.level || '',
      sort: draft.sort || 'name',
      dir: draft.dir || 'ASC'
    });
  };

  const tableActions = (row) => (
    <IconButton
      onClick={() => {
        const parentName = encodeURIComponent(row?.name || '');
        router.push(`/categories/create?parent_id=${row.id}&parent_name=${parentName}`);
      }}
    >
      <PlusSquareOutlined />
    </IconButton>
  );

  const topActionsLeft = () => (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
      <CategoriesFilters value={filterUi} onChange={onFilterUiChange} />
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
    </Stack>
  );

  const topActions = () => (
    <Button variant="outlined" size="small" onClick={() => setBulkOpen(true)}>
      Bulk Upload
    </Button>
  );

  return (
    <>
      <CategoriesTableSection
        tableActions={tableActions}
        rows={data}
        handleAddButton={() => router.push('/categories/create')}
        handleEditButton={(row) => router.push(`/categories/edit/${row.id}`)}
        handleViewButton={(row) => router.push(`/categories/${row.id}`)}
        pageIndex={(Number(applied.page) || 1) - 1}
        pageSize={Number(applied.limit) || DEFAULT_PAGE_SIZE}
        totalPageCount={totalPages}
        totalCount={total}
        onPaginationChange={handlePaginationChange}
        topActionsLeft={topActionsLeft}
        topActions={topActions}
      />
      <CategoriesBulkUploadDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onDone={() => applySearch()}
      />
    </>
  );
}

export default CategoriesView;
