'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import {
  Alert,
  Autocomplete,
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
import { getCategory, listCategories } from 'api/catalog';
import { listStoreVariants } from 'api/listingsInventory';
import { enqueueStoreCsvExport, listStoreCsvJobs, abortStoreCsvJob, storeCsvJobDownloadPath } from 'api/csvJobs';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import { formatINR } from 'utils/currency';
import { downloadCsv, storeVariantsToCsv } from 'utils/storeVariantCsv';
import StoreVariantsBulkUpdatePanel from 'sections/stores/StoreVariantsBulkUpdatePanel';
import CsvJobsList from 'sections/csv/CsvJobsList';

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
  const categoryId = searchParams?.get('category_id') || '';
  const page = parsePage(searchParams?.get('page'));
  const pageSize = parseLimit(searchParams?.get('limit'));

  const [qDraft, setQDraft] = useState(q);
  const [stockDraft, setStockDraft] = useState(stockStatus);
  const [listingDraft, setListingDraft] = useState(listingStatus);
  const [categorySel, setCategorySel] = useState(null);
  const categoryAc = usePagedAutocomplete(listCategories);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [jobsTick, setJobsTick] = useState(0);

  useEffect(() => {
    setQDraft(q);
    setStockDraft(stockStatus);
    setListingDraft(listingStatus);
  }, [q, stockStatus, listingStatus]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (categoryId) {
          if (categorySel?.id === categoryId) return;
          const res = await getCategory(categoryId);
          if (!cancelled) setCategorySel(res?.data || res || null);
        } else if (!cancelled) {
          setCategorySel(null);
        }
      } catch {
        if (!cancelled) setCategorySel(null);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate from URL only
  }, [categoryId]);

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
        ...(listingStatus ? { status: listingStatus } : {}),
        ...(categoryId ? { category_id: categoryId } : {})
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
  }, [categoryId, listingStatus, page, pageSize, q, stockStatus, storeId]);

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
    patchUrl({
      q: qDraft.trim(),
      category_id: categorySel?.id || '',
      stock: stockDraft || '',
      listing: listingDraft || '',
      page: 1
    });
  };

  const handleDownloadSelected = () => {
    const selectedSet = new Set(selected);
    const rows = items.filter((it) => selectedSet.has(it.id));
    if (!rows.length) {
      enqueueSnackbar('Nothing to download', { variant: 'warning' });
      return;
    }
    downloadCsv('store-variants-selected.csv', storeVariantsToCsv(rows));
  };

  const handleDownloadAll = async () => {
    try {
      await enqueueStoreCsvExport(storeId, {
        q,
        stock_status: stockStatus,
        status: listingStatus,
        category_id: categoryId
      });
      enqueueSnackbar('Queued — you can close this page.', { variant: 'success' });
      setJobsTick((n) => n + 1);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e?.message || 'Could not queue export', { variant: 'error' });
    }
  };

  const loadStoreJobs = useCallback(() => listStoreCsvJobs(storeId, { limit: 20 }), [storeId]);

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
      <Autocomplete
        sx={{ minWidth: 180 }}
        size="small"
        options={categoryAc.options}
        value={categorySel}
        loading={categoryAc.loading}
        onChange={(_, v) => setCategorySel(v)}
        onInputChange={(_, v, reason) => {
          if (reason === 'reset') return;
          categoryAc.setQuery(v);
        }}
        getOptionLabel={(opt) => (opt?.name ? String(opt.name) : '')}
        getOptionKey={(opt) => opt?.id || String(opt?.name || '')}
        isOptionEqualToValue={(a, b) => a?.id === b?.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Category"
            placeholder="All categories"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {categoryAc.loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
        ListboxProps={{ onScroll: categoryAc.handleScroll, style: { maxHeight: 280, overflow: 'auto' } }}
      />
      <TextField
        select
        size="small"
        label="Stock"
        value={stockDraft}
        onChange={(e) => setStockDraft(e.target.value)}
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
        value={listingDraft}
        onChange={(e) => setListingDraft(e.target.value)}
        sx={{ minWidth: 120 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="ACTIVE">Active</MenuItem>
        <MenuItem value="INACTIVE">Inactive</MenuItem>
      </TextField>
      <Button variant="outlined" size="small" onClick={handleSearch}>
        Search
      </Button>
      <Button variant="outlined" size="small" onClick={handleDownloadAll}>
        Download
      </Button>
      {selected.length > 0 ? (
        <Button variant="text" size="small" onClick={handleDownloadSelected}>
          Download selected ({selected.length})
        </Button>
      ) : null}
    </Stack>
  );

  return (
    <Stack spacing={2}>
      <MainCard
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
            {q || stockStatus || listingStatus || categoryId
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

      <Box>
        <MainCard title="Update from CSV" subheader="Download listings above, edit, then re-upload the same file.">
          <StoreVariantsBulkUpdatePanel
            storeId={storeId}
            isDemo={isDemo}
            onQueued={() => {
              setJobsTick((n) => n + 1);
              load();
            }}
          />
        </MainCard>
      </Box>

      <CsvJobsList
        title="CSV jobs"
        loadJobs={loadStoreJobs}
        downloadPath={(jobId, file) => storeCsvJobDownloadPath(storeId, jobId, file)}
        abortJob={(jobId, body) => abortStoreCsvJob(storeId, jobId, body)}
        refreshKey={jobsTick}
        emptyText="Exports, listing updates, and bulk add jobs for this store show up here."
      />
    </Stack>
  );
}

StoreVariantsGrid.propTypes = {
  storeId: PropTypes.string,
  isDemo: PropTypes.bool
};
