'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Link as LinkMui,
  MenuItem,
  Popover,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import MainCard from 'components/MainCard';
import { TablePagination } from 'components/third-party/react-table';
import { listStoreVariants } from 'api/listingsInventory';
import { formatINR } from 'utils/currency';
import { downloadCsv, storeVariantsToCsv } from 'utils/storeVariantCsv';
import StoreVariantsBulkUpdatePanel from 'sections/stores/StoreVariantsBulkUpdatePanel';
import StoreVariantsImportResult from 'sections/stores/detail/StoreVariantsImportResult';

const DEFAULT_LIMIT = 10;

function parseLimit(raw) {
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 1 && n <= 100) return n;
  return DEFAULT_LIMIT;
}

function parsePage(raw) {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function mergeQuery(searchParams, patch) {
  const sp = new URLSearchParams(searchParams?.toString() || '');
  for (const [key, value] of Object.entries(patch)) {
    const empty = value == null || value === '';
    const skipDefault =
      (key === 'page' && Number(value) === 1) || (key === 'limit' && Number(value) === DEFAULT_LIMIT);
    if (empty || skipDefault) sp.delete(key);
    else sp.set(key, String(value));
  }
  if (!sp.get('tab')) sp.set('tab', 'variants');
  return sp.toString();
}

const getThumbUrl = (item) => {
  const images = item?.product_variant?.product?.images;
  if (!Array.isArray(images) || !images.length) return null;
  const img = images[0];
  return typeof img === 'string' ? img : img?.thumb_url || img?.url || null;
};

const getProductName = (item) => item?.product_variant?.product?.name || '—';

function ProductThumb({ url, name }) {
  const [anchorEl, setAnchorEl] = useState(null);

  if (!url) {
    return (
      <Avatar variant="rounded" sx={{ width: 40, height: 40, fontSize: 14 }}>
        {(name || '?').slice(0, 1).toUpperCase()}
      </Avatar>
    );
  }

  const open = Boolean(anchorEl);

  return (
    <Box
      onMouseEnter={(e) => setAnchorEl(e.currentTarget)}
      onMouseLeave={() => setAnchorEl(null)}
      sx={{ display: 'inline-flex', cursor: 'zoom-in' }}
    >
      <Avatar src={url} alt={name || ''} variant="rounded" sx={{ width: 40, height: 40 }} />
      <Popover
        open={open}
        anchorEl={anchorEl}
        sx={{ pointerEvents: 'none' }}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: { p: 0.5, overflow: 'hidden', boxShadow: 6 }
          }
        }}
      >
        <Box
          component="img"
          src={url}
          alt={name || ''}
          sx={{
            display: 'block',
            maxWidth: 280,
            maxHeight: 280,
            width: 'auto',
            height: 'auto',
            objectFit: 'contain'
          }}
        />
      </Popover>
    </Box>
  );
}

ProductThumb.propTypes = {
  url: PropTypes.string,
  name: PropTypes.string
};

function stockLabel(status) {
  if (status === 'OUT_OF_STOCK') return 'Out';
  if (status === 'IN_STOCK') return 'In';
  if (status === 'PREORDER') return 'Preorder';
  return status || '—';
}

export default function StoreVariantsGrid({ storeId, isDemo = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams?.get('q') || '';
  const stockStatus = searchParams?.get('stock') || '';
  const listingStatus = searchParams?.get('listing') || '';
  const page = parsePage(searchParams?.get('page'));
  const pageSize = parseLimit(searchParams?.get('limit'));

  const [qDraft, setQDraft] = useState(q);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [updateResult, setUpdateResult] = useState(null);
  const updateSectionRef = useRef(null);

  useEffect(() => {
    setQDraft(q);
  }, [q]);

  const patchUrl = useCallback(
    (patch) => {
      const qs = mergeQuery(searchParams, patch);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const load = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await listStoreVariants(storeId, {
        page,
        limit: pageSize,
        ...(q ? { q } : {}),
        ...(stockStatus ? { stock_status: stockStatus } : {}),
        ...(listingStatus ? { status: listingStatus } : {})
      });
      const list = Array.isArray(resp?.data) ? resp.data : [];
      setItems(list);
      setTotalPages(resp?.meta?.totalPages || 1);
      setTotalCount(resp?.meta?.total ?? list.length);
      setSelected([]);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load store variants');
      setItems([]);
      setTotalPages(1);
      setTotalCount(0);
      setSelected([]);
    } finally {
      setLoading(false);
    }
  }, [listingStatus, page, pageSize, q, stockStatus, storeId]);

  useEffect(() => {
    load();
  }, [load]);

  const itemIds = useMemo(() => items.map((it) => it.id).filter(Boolean), [items]);
  const allSelected = itemIds.length > 0 && selected.length === itemIds.length;
  const someSelected = selected.length > 0 && selected.length < itemIds.length;

  const toggleOne = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelected(allSelected ? [] : itemIds);
  };

  const handleSearch = () => {
    patchUrl({ q: qDraft.trim(), page: 1 });
  };

  const handleDownload = () => {
    const selectedSet = new Set(selected);
    const rows = selected.length ? items.filter((it) => selectedSet.has(it.id)) : items;
    if (!rows.length) {
      enqueueSnackbar('Nothing to download', { variant: 'warning' });
      return;
    }
    downloadCsv(
      selected.length ? 'store-variants-selected.csv' : 'store-variants.csv',
      storeVariantsToCsv(rows)
    );
  };

  const handleUpdateDone = (data) => {
    setUpdateResult(data);
    load();
  };

  useEffect(() => {
    if (!updateResult) return;
    updateSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [updateResult]);

  if (!storeId) return null;

  const filterBar = (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} useFlexGap flexWrap="wrap">
      <TextField
        size="small"
        label="Search"
        value={qDraft}
        onChange={(e) => setQDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="SKU, name, or id…"
        sx={{ minWidth: 180 }}
      />
      <TextField
        select
        size="small"
        label="Stock"
        value={stockStatus}
        onChange={(e) => patchUrl({ stock: e.target.value, page: 1 })}
        sx={{ minWidth: 110 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="in">In</MenuItem>
        <MenuItem value="out">Out</MenuItem>
      </TextField>
      <TextField
        select
        size="small"
        label="Listing"
        value={listingStatus}
        onChange={(e) => patchUrl({ listing: e.target.value, page: 1 })}
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="ACTIVE">Active</MenuItem>
        <MenuItem value="INACTIVE">Inactive</MenuItem>
      </TextField>
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
      <Button variant="outlined" size="small" onClick={handleDownload} disabled={loading || items.length === 0}>
        {selected.length ? `Download selected (${selected.length})` : 'Download'}
      </Button>
    </Stack>
  );

  return (
    <Stack spacing={2}>
      <MainCard
        title="Store variants"
        secondary={filterBar}
      >
        {isDemo && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Bulk listing update is only available for live stores. Download still works.
          </Alert>
        )}

        {loading && (
          <Stack alignItems="center" py={3}>
            <CircularProgress size={24} />
          </Stack>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && items.length === 0 && (
          <Alert severity="info">
            {q || stockStatus || listingStatus
              ? 'No variants match these filters.'
              : 'No variants listed for this store yet.'}
          </Alert>
        )}
        {!loading && !error && items.length > 0 && (
          <Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        indeterminate={someSelected}
                        checked={allSelected}
                        onChange={toggleAll}
                      />
                    </TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Listing</TableCell>
                    <TableCell align="right">MRP</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell align="right">Max / order</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => {
                    const name = getProductName(item);
                    const sku = item?.product_variant?.sku;
                    const productId = item?.product_variant?.product?.id || item?.product_variant?.product_id;
                    const variantId = item?.product_variant?.id || item?.variant_id;
                    const listing = item?.status || '—';
                    const stock = item?.stock_status;
                    return (
                      <TableRow key={item.id} hover selected={selected.includes(item.id)}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            size="small"
                            checked={selected.includes(item.id)}
                            onChange={() => toggleOne(item.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <ProductThumb url={getThumbUrl(item)} name={name} />
                        </TableCell>
                        <TableCell>
                          {productId ? (
                            <LinkMui
                              component={Link}
                              href={`/products/${productId}`}
                              underline="hover"
                              variant="body2"
                            >
                              {name}
                            </LinkMui>
                          ) : (
                            <Typography variant="body2">{name}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {variantId && sku ? (
                            <LinkMui
                              component={Link}
                              href={`/product-variants/${variantId}`}
                              underline="hover"
                              variant="body2"
                            >
                              {sku}
                            </LinkMui>
                          ) : (
                            <Typography variant="body2">{sku || '—'}</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            variant="outlined"
                            color={listing === 'ACTIVE' ? 'success' : 'default'}
                            label={listing}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            {formatINR(item?.mrp_cents)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{formatINR(item?.price_cents)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            variant="light"
                            color={stock === 'IN_STOCK' || stock === 'PREORDER' ? 'success' : 'default'}
                            label={stockLabel(stock)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{item?.max_per_order ?? '—'}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Divider />
            <Box sx={{ pt: 2 }}>
              <TablePagination
                getPageCount={() => Math.max(1, totalPages)}
                getState={() => ({ pagination: { pageIndex: page - 1, pageSize } })}
                setPageIndex={(idx) => patchUrl({ page: Math.max(1, Number(idx) + 1) })}
                setPageSize={(next) => {
                  const n = Number(next);
                  if (n === pageSize) return;
                  patchUrl({ limit: n, page: 1 });
                }}
                initialPageSize={pageSize}
                totalCount={totalCount}
              />
            </Box>
          </Stack>
        )}
      </MainCard>

      <Box ref={updateSectionRef}>
        <MainCard title="Update from CSV" subheader="Download listings above, edit, then re-upload the same file.">
          <Stack spacing={2}>
            {updateResult ? (
              <StoreVariantsImportResult
                embedded
                result={updateResult}
                onDismiss={() => setUpdateResult(null)}
              />
            ) : null}
            <StoreVariantsBulkUpdatePanel storeId={storeId} isDemo={isDemo} onDone={handleUpdateDone} />
          </Stack>
        </MainCard>
      </Box>
    </Stack>
  );
}

StoreVariantsGrid.propTypes = {
  storeId: PropTypes.string,
  isDemo: PropTypes.bool
};
