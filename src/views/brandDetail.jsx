'use client';

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';

import {
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import { useParams } from 'next/navigation';
import { actions as catalog } from 'store/catalog/slice';

// --- helpers ---
const safe = (v) => (v === null || v === undefined || v === '' ? '—' : String(v));

const StatusChip = ({ value }) => {
  const map = {
    DRAFT: { color: 'default', label: 'Draft' },
    SUBMITTED: { color: 'warning', label: 'Submitted' },
    APPROVED: { color: 'success', label: 'Approved' },
    REJECTED: { color: 'error', label: 'Rejected' }
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

const Field = ({ label, value, mono = false }) => {
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
};

export function BrandDetail() {
  const dispatch = useDispatch();
  const { id } = useParams();

  const { brandDetail } = useSelector((s) => s.catalog || {});
  const detail = brandDetail || { data: null, loading: false, error: null };
  const brand = detail.data;

  useEffect(() => {
    if (!id) return;
    dispatch(catalog.brandsGetRequest({ params: { id } }));
  }, [dispatch, id]);

  useEffect(() => {
    if (detail.error) enqueueSnackbar(detail.error, { variant: 'error' });
  }, [detail.error]);

  const breadcrumb = useMemo(() => {
    const name = brand?.name || id || 'brand';
    return {
      heading: 'brand',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'brands', to: '/brands' },
        { title: name, i18: false }
      ]
    };
  }, [brand?.name, id]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />

      <MainCard border={false} boxShadow>
        {detail.loading && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress size={28} />
          </Stack>
        )}

        {!detail.loading && !brand && (
          <Typography variant="body2" color="text.secondary">
            No data.
          </Typography>
        )}

        {!detail.loading && brand && (
          <Stack spacing={3}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2}>
              {brand.logo_url ? (
                <Avatar
                  alt={brand.name}
                  src={brand.logo_url}
                  variant="rounded"
                  sx={{ width: 48, height: 48, borderRadius: 1 }}
                />
              ) : (
                <Avatar variant="rounded" sx={{ width: 48, height: 48, borderRadius: 1 }}>
                  {brand.name?.[0]?.toUpperCase() || 'B'}
                </Avatar>
              )}

              <Stack flex={1}>
                <Typography variant="h6">{brand.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {brand.slug}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <StatusChip value={brand.status} />
                <RecordStatusChip value={brand.record_status} />
              </Stack>
            </Stack>

            <Divider />

            {/* Two columns layout using Stacks */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              {/* left column */}
              <Stack flex={1} spacing={2}>
                <Field label="ID" value={brand.id} mono />
                <Field label="Slug" value={brand.slug} />
                <Field label="Sort Letter" value={brand.sort_letter} />
                <Field label="Description" value={brand.description} />
                <Field label="Logo URL" value={brand.logo_url} />
              </Stack>

              {/* right column */}
              <Stack flex={1} spacing={2}>
                {/* keep this side for any extra brand metadata you add later */}
              </Stack>
            </Stack>

            <Divider />

            {/* Audit section */}
            <Typography variant="subtitle2">Audit</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Stack flex={1} spacing={2}>
                <Field label="Created By" value={brand.created_by} mono />
                <Field label="Updated By" value={brand.updated_by} mono />
              </Stack>
              <Stack flex={1} spacing={2}>
                <Field label="Created At" value={brand.created_at ? new Date(brand.created_at).toLocaleString() : '—'} />
                <Field label="Updated At" value={brand.updated_at ? new Date(brand.updated_at).toLocaleString() : '—'} />
                <Field label="Deleted At" value={brand.deleted_at ? new Date(brand.deleted_at).toLocaleString() : '—'} />
              </Stack>
            </Stack>
          </Stack>
        )}
      </MainCard>
    </>
  );
}

export default BrandDetail;
