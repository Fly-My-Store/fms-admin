'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as attributes } from 'store/attributes/slice';
import ProductAttrsTableSection from 'sections/product-attributes/ProductAttrsTableSection';
import { useRouter } from 'next/navigation';
import ProductAttrsUpsertRow from 'sections/product-attributes/ProductAttrsUpsertRow';
import MainCard from 'components/MainCard';
import { CircularProgress, Typography, Stack, Button } from '@mui/material';
import { listDefs } from 'api/attributes';

export function ProductAttrsView({ product_id, productName, category_id }) {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.attributes || {});
  const list = state.productAttrs || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error, loading } = list;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const router = useRouter();
  const [defs, setDefs] = useState([]);
  const [defsLoading, setDefsLoading] = useState(false);
  const [defQuery, setDefQuery] = useState('');

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

  useEffect(() => {
    async function loadDefs() {
      try {
        setDefsLoading(true);
        const res = await listDefs({ q: defQuery, category_id, limit: 20 });
        const rows = res?.data || res?.data?.rows || [];
        setDefs(rows);
      } catch (e) {
        setDefs(rows);
        enqueueSnackbar('Failed to load attribute defs', { variant: 'error' });
      } finally {
        setDefsLoading(false);
      }
    }
    loadDefs();
  }, [defQuery, category_id]);
  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {loading && (
        <Stack alignItems="center" py={2}>
          <CircularProgress size={24} />
        </Stack>
      )}

      {data.length === 0 && !loading ? (
        <Typography variant="body2" color="text.secondary">
          No attributes yet.
        </Typography>
      ) : null}

      {data.map((row) => (
        <ProductAttrsUpsertRow
          key={row.attribute_code}
          product_id={product_id}
          row={row}
          defs={defs}
          defsLoading={defsLoading}
          setDefQuery={setDefQuery}
        />
      ))}

      {/* simple pager */}
      {totalPages > 1 && (
        <Stack direction="row" justifyContent="space-between" pt={1}>
          <Button
            disabled={page <= 1}
            onClick={() => reload({ pageIndex: Math.max(page - 2, 0), pageSize })}
          >
            Previous
          </Button>
          <Typography variant="caption">
            Page {page} / {totalPages}
          </Typography>
          <Button
            disabled={page >= totalPages}
            onClick={() => reload({ pageIndex: page, pageSize })}
          >
            Next
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

export default ProductAttrsView;
