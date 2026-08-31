'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Pagination,
  Stack,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import { listStoreVariants } from 'api/listingsInventory';
import { formatINR } from 'utils/currency';

const PAGE_SIZE = 10;

const getThumbUrl = (item) => {
  const images = item?.product_variant?.product?.images;
  if (!Array.isArray(images) || !images.length) return null;
  const img = images[0];
  return typeof img === 'string' ? img : img?.url || null;
};

const getProductName = (item) =>
  item?.product_variant?.product?.name || item?.product_variant?.sku || 'Variant';

function VariantCard({ item }) {
  const thumb = getThumbUrl(item);
  const name = getProductName(item);
  const sku = item?.product_variant?.sku;
  const stockStatus = item?.stock_status || '—';
  const status = item?.status || '—';

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {thumb ? (
        <Box component="img" src={thumb} alt={name} sx={{ height: 120, objectFit: 'cover', width: '100%' }} />
      ) : (
        <Box sx={{ height: 120, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            No image
          </Typography>
        </Box>
      )}
      <Stack spacing={0.5} sx={{ p: 1.5, flex: 1 }}>
        <Typography variant="subtitle2" noWrap title={name}>
          {name}
        </Typography>
        {sku ? (
          <Typography variant="caption" color="text.secondary" noWrap title={sku}>
            {sku}
          </Typography>
        ) : null}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
          <Chip size="small" label={status} variant="outlined" />
          <Chip
            size="small"
            color={stockStatus === 'IN_STOCK' || stockStatus === 'PREORDER' ? 'success' : 'default'}
            label={stockStatus === 'OUT_OF_STOCK' ? 'Out of stock' : stockStatus === 'IN_STOCK' ? 'In stock' : stockStatus}
            variant="light"
          />
        </Stack>
        <Typography variant="body2">{formatINR(item?.price_cents)}</Typography>
      </Stack>
    </Box>
  );
}

VariantCard.propTypes = {
  item: PropTypes.object.isRequired
};

export default function StoreVariantsGrid({ storeId, isDemo = false }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await listStoreVariants(storeId, { page, limit: PAGE_SIZE });
      const list = Array.isArray(resp?.data) ? resp.data : [];
      setItems(list);
      setTotalPages(resp?.meta?.totalPages || 1);
      setTotalCount(resp?.meta?.total ?? list.length);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load store variants');
      setItems([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, storeId]);

  useEffect(() => {
    setPage(1);
  }, [storeId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!storeId) return null;

  return (
    <MainCard
      title="Store variants"
      subheader={`${totalCount} listing${totalCount === 1 ? '' : 's'}`}
    >
      {isDemo && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Bulk listing import is only available for live stores.
        </Alert>
      )}
      {loading && (
        <Stack alignItems="center" py={3}>
          <CircularProgress size={24} />
        </Stack>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && items.length === 0 && (
        <Alert severity="info">No variants listed for this store yet.</Alert>
      )}
      {!loading && !error && items.length > 0 && (
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2
            }}
          >
            {items.map((item) => (
              <VariantCard key={item.id} item={item} />
            ))}
          </Box>
          {totalPages > 1 && (
            <Stack alignItems="center">
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="small"
              />
            </Stack>
          )}
        </Stack>
      )}
    </MainCard>
  );
}

StoreVariantsGrid.propTypes = {
  storeId: PropTypes.string,
  isDemo: PropTypes.bool
};
