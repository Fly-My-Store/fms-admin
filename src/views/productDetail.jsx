'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';

import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Tabs,
  Tab,
  Tooltip,
  Typography,
  Button
} from '@mui/material';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { actions as catalog } from 'store/catalog/slice';
import { ProductAttrsView } from './productAttributes';
import ProductVariantsView from './productVariants';
import { HomeOutlined } from '@ant-design/icons';

const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const StatusChip = ({ value }) => {
  const map = {
    DRAFT: { color: 'default', label: 'Draft' },
    SUBMITTED: { color: 'warning', label: 'Submitted' },
    APPROVED: { color: 'success', label: 'Approved' },
    REJECTED: { color: 'error', label: 'Rejected' },
    DISABLED: { color: 'default', label: 'Disabled' }
  };
  const meta = map?.[value] ?? { color: 'default', label: safe(value) };
  return <Chip size="small" color={meta.color} label={meta.label} variant="light" />;
};

const RecordStatusChip = ({ value }) => {
  const map = {
    1: { color: 'success', label: 'Active' },
    2: { color: 'warning', label: 'Inactive' },
    3: { color: 'default', label: 'Archived' }
  };
  const meta = map?.[value] ?? { color: 'default', label: safe(value) };
  return <Chip size="small" color={meta.color} label={meta.label} variant="light" />;
};

function Field({ label, value, mono = false }) {
  const content = safe(value);
  const body = (
    <Typography
      variant="body2"
      sx={{ fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined, wordBreak: 'break-word' }}
    >
      {content}
    </Typography>
  );
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      {String(content).length > 36 ? <Tooltip title={String(content)}>{body}</Tooltip> : body}
    </Stack>
  );
}


export default function ProductDetail() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const routeId = params?.id;
  const iTab = search?.get('t');
  const id = routeId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { productDetail } = useSelector((s) => s.catalog || {});
  const detail = productDetail || { data: null, loading: false, error: null };
  const data = detail.data;
  const primaryImage = (data?.images || []).find((im) => im.is_primary) || data?.images?.[0] || null;

  const breadcrumb = useMemo(() => {
    const name = data?.name || id || 'product';
    return {
      heading: 'product',
      links: [
        { title: 'home', to: '/dashboard', icon: HomeOutlined },
        { title: 'products', to: '/products' },
        { title: name, i18n: false }
      ]
    };
  }, [data?.name, id]);

  useEffect(() => {
    if (!id) return;
    dispatch(catalog.productsGetRequest({ params: { id } }));
  }, [dispatch, id]);

  const [tab, setTab] = useState(iTab || 'attrs');
  const handleChange = (e, v) => setTab(v);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard border={false} boxShadow>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Left summary */}
          <Stack flex={3} spacing={2}>
            {loading && <Alert severity="info">Loading…</Alert>}
            {!loading && data && (
              <>
                {/* Header */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar variant="rounded" src={primaryImage?.url || ''} sx={{ width: 72, height: 72, borderRadius: 1 }}>
                    {!primaryImage?.url ? (data?.name || 'P')[0] : null}
                  </Avatar>
                  <Stack>
                    <Typography variant="h6">{data?.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data?.slug}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <StatusChip value={data?.status} />
                      <RecordStatusChip value={data?.record_status} />
                    </Stack>
                  </Stack>
                </Stack>

                <Divider />

                {/* Brand / Category */}
                <Stack direction="row" spacing={2} alignItems="center">
                  {data?.brand?.logo_url ? (
                    <Avatar src={data.brand.logo_url} sx={{ width: 24, height: 24 }} />
                  ) : null}
                  <Typography variant="body2">
                    <b>Brand:</b> {data?.brand?.name || '—'}
                  </Typography>
                  <Typography variant="body2">
                    <b>Category:</b> {data?.category?.name || '—'}
                  </Typography>
                </Stack>

                {/* Rating */}
                <Stack direction="row" spacing={2}>
                  <Field label="Rating" value={data?.rating != null ? Number(data.rating).toFixed(2) : '—'} />
                  <Field label="Rating Count" value={data?.rating_count} />
                </Stack>

                {/* Description */}
                <Field label="Description" value={data?.description} />

                {/* Images */}
                <Stack spacing={1} sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Images</Typography>
                  {Array.isArray(data?.images) && data.images.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                      {data.images.map((im) => (
                        <Box
                          key={im.id || im.url}
                          sx={{
                            position: 'relative',
                            width: 96,
                            height: 96,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: im.is_primary ? 'primary.main' : 'divider',
                            boxShadow: im.is_primary ? 2 : 0,
                            bgcolor: 'background.paper'
                          }}
                          onClick={() => window.open(im.url, '_blank')}
                        >
                          <Box
                            component="img"
                            src={im.url}
                            alt={im.alt_text || ''}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                          {im.is_primary ? (
                            <Chip
                              size="small"
                              color="primary"
                              label="Primary"
                              sx={{ position: 'absolute', top: 6, left: 6 }}
                            />
                          ) : null}
                          {im.role ? (
                            <Chip
                              size="small"
                              variant="outlined"
                              label={im.role}
                              sx={{ position: 'absolute', bottom: 6, left: 6, bgcolor: 'background.paper' }}
                            />
                          ) : null}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No images.
                    </Typography>
                  )}
                </Stack>

                {/* JSON blocks */}
                <Field label="Specifications" value={data?.spec_json ? JSON.stringify(data.spec_json) : '—'} mono />

                {/* Actions */}
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" onClick={() => router.push(`/products/edit/${data?.id}`)}>Edit Product</Button>
                </Stack>
              </>
            )}
          </Stack>

          {/* Right tabs */}
          <Stack flex={9} spacing={2}>
            <ProductVariantsView
              product_id={id}
              productName={data?.name || ''}
            />
          </Stack>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <ProductAttrsView
          product_id={id}
          productName={data?.name || ''}
          category_id={data?.category?.id || null}
        />
      </MainCard>
    </>
  );
}
