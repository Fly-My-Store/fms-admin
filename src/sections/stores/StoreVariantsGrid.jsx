'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardMedia,
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
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {thumb ? (
        <CardMedia component="img" height={120} image={thumb} alt={name} sx={{ objectFit: 'cover' }} />
      ) : (
        <Box
          sx={{
            height: 120,
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="caption" color="text.secondary">
            No image
          </Typography>
        </Box>
      )}
      <CardContent sx={{ flex: 1, pt: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="subtitle2" noWrap title={name}>
          {name}
        </Typography>
        {sku && (
          <Typography variant="caption" color="text.secondary" display="block" noWrap title={sku}>
            {sku}
          </Typography>
        )}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 1, gap: 0.5 }}>
          <Chip size="small" label={status} variant="outlined" />
          <Chip
            size="small"
            color={stockStatus === 'IN_STOCK' ? 'success' : stockStatus === 'PREORDER' ? 'warning' : 'default'}
            label={stockStatus}
            variant="light"
          />
        </Stack>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {formatINR(item?.price_cents)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Stock: {item?.available_quantity ?? item?.stock_quantity ?? 0}
        </Typography>
      </CardContent>
    </Card>
  );
}

VariantCard.propTypes = {
  item: PropTypes.object.isRequired
};

export default function StoreVariantsGrid({ storeId }) {
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
    <MainCard title="Store variants" subheader={`${totalCount} listing${totalCount === 1 ? '' : 's'}`}>
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
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
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
  storeId: PropTypes.string
};
