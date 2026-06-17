'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';

import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Tooltip,
  Typography,
  Checkbox,
  TablePagination,
  TextField
} from '@mui/material';
import { useParams, useSearchParams } from 'next/navigation';
import { actions as catalog } from 'store/catalog/slice';
import { actions as attributes } from 'store/attributes/slice';

// --- helpers ---
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
  // 1 ACTIVE, 2 INACTIVE, 3 ARCHIVED (from backend enums)
  const map = {
    1: { color: 'success', label: 'Active' },
    2: { color: 'warning', label: 'Inactive' },
    3: { color: 'default', label: 'Archived' }
  };
  const meta = map?.[value] ?? { color: 'default', label: safe(value) };
  return <Chip size="small" color={meta.color} label={meta.label} variant="light" />;
};

const Field = ({ label, value, mono = false, copy = false }) => {
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

export function CategoryDetail() {
  const dispatch = useDispatch();
  const params = useSearchParams();
  const { id } = useParams();

  const { categoryDetail } = useSelector((s) => s.catalog || {});
  const detail = categoryDetail || { data: null, loading: false, error: null };
  const cat = detail.data;

  // attribute defs (paged list) + category assigned attrs
  const { defs } = useSelector((s) => s.attributes || {});
  const { categoryAttrs } = useSelector((s) => s.attributes || {});

  const [attrQ, setAttrQ] = useState('');
  const [attrPage, setAttrPage] = useState(1);
  const [attrPageSize, setAttrPageSize] = useState(20);

  // Pending optimistic overrides: { [attribute_code]: boolean }
  const [pendingMap, setPendingMap] = useState({});

  // Backend-assigned attributes as a Set (derived from redux)
  const backendAssignedSet = useMemo(() => {
    const rows = (categoryAttrs?.data || categoryAttrs?.rows || []);
    return new Set(rows.map((r) => r.attribute_code));
  }, [categoryAttrs]);

  // Read helper: if we have a pending override, use it; else use backend
  const isChecked = (code) => (Object.prototype.hasOwnProperty.call(pendingMap, code) ? !!pendingMap[code] : backendAssignedSet.has(code));

  useEffect(() => {
    if (!id) return;
    dispatch(catalog.categoriesGetRequest({ params: { id } }));
  }, [dispatch, id]);

  // load attribute defs (paged)
  useEffect(() => {
    dispatch(attributes.defsListRequest({ params: { q: attrQ, page: attrPage, limit: attrPageSize } }));
  }, [dispatch, attrQ, attrPage, attrPageSize]);

  // load currently assigned attributes for this category
  useEffect(() => {
    if (!id) return;
    // pull a large page to materialize a set client-side
    dispatch(attributes.categoryAttrsListRequest({ params: { category_id: id, page: 1, limit: 1000 } }));
  }, [dispatch, id]);

  // Reconcile pending selections when backend catches up
  useEffect(() => {
    if (!pendingMap || !Object.keys(pendingMap).length) return;
    const next = { ...pendingMap };
    let changed = false;
    for (const [code, val] of Object.entries(pendingMap)) {
      if (backendAssignedSet.has(code) === !!val) {
        delete next[code];
        changed = true;
      }
    }
    if (changed) setPendingMap(next);
  }, [backendAssignedSet, pendingMap]);

  useEffect(() => {
    if (detail.error) enqueueSnackbar(detail.error, { variant: 'error' });
  }, [detail.error]);

  const handleToggleAttr = (def, nextChecked) => {
    const code = def?.code;
    if (!code || !id) return;

    // optimistic override for UI
    setPendingMap((prev) => ({ ...prev, [code]: nextChecked }));

    if (nextChecked) {
      dispatch(attributes.categoryAttrsCreateRequest({ params: { category_id: id, attribute_code: code } }));
    } else {
      dispatch(attributes.categoryAttrsRemoveRequest({ params: { category_id: id, attribute_code: code } }));
    }

    // ask backend for fresh mapping; reconciliation effect will clear pending when it matches
    dispatch(attributes.categoryAttrsListRequest({ params: { category_id: id, page: 1, limit: 1000 } }));
  };

  const breadcrumb = useMemo(() => {
    const name = cat?.name || id || 'category';
    return {
      heading: 'categories',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'categories', to: '/categories' },
        { title: name, i18n: false }
      ]
    };
  }, [cat?.name, id]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />

      <MainCard border={false} boxShadow>
        {detail.loading && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress size={28} />
          </Stack>
        )}

        {!detail.loading && !cat && (
          <Typography variant="body2" color="text.secondary">
            No data.
          </Typography>
        )}

        {!detail.loading && cat && (
          <Stack spacing={3}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={2}>
              {cat.icon_url ? (
                <Avatar
                  alt={cat.name}
                  src={cat.icon_url}
                  variant="rounded"
                  sx={{ width: 48, height: 48, borderRadius: 1 }}
                />
              ) : (
                <Avatar variant="rounded" sx={{ width: 48, height: 48, borderRadius: 1 }}>
                  {cat.name?.[0]?.toUpperCase() || 'C'}
                </Avatar>
              )}

              <Stack flex={1}>
                <Typography variant="h6">{cat.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {cat.slug}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <StatusChip value={cat.status} />
                <RecordStatusChip value={cat.record_status} />
              </Stack>
            </Stack>

            <Divider />

            {/* Two columns layout using Stacks */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              {/* left column */}
              <Stack flex={1} spacing={2}>
                <Field label="ID" value={cat.id} mono />
                <Field label="Parent ID" value={cat.parent_id} mono />
                <Field label="Level" value={cat.level} />
                <Field label="Description" value={cat.description} />
                <Field label="Icon URL" value={cat.icon_url} />
              </Stack>

              {/* right column */}
              <Stack flex={2} spacing={2}>
                <Typography variant="subtitle1">Attributes</Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <TextField
                    size="small"
                    label="Search attributes"
                    value={attrQ}
                    onChange={(e) => { setAttrQ(e.target.value); setAttrPage(1); }}
                    placeholder="Search by code or name"
                    sx={{ maxWidth: 360 }}
                  />
                </Stack>

                {((defs?.data || defs?.rows || []).length > 0) ? (
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)'
                    },
                    gap: 1.5
                  }}>
                    {(defs?.data || defs?.rows || []).map((def) => {
                      return (
                        <Box key={def.code} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.25, bgcolor: 'background.paper' }}>
                          <Stack direction="row" spacing={1.25} alignItems="flex-start">
                            <Checkbox
                              size="small"
                              checked={isChecked(def.code)}
                              onChange={(e) => handleToggleAttr(def, e.target.checked)}
                            />
                            <Stack spacing={0.25} flex={1}>
                              <Typography variant="body2" sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{def.code}</Typography>
                              <Typography variant="body2">{def.name}</Typography>
                            </Stack>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Stack alignItems="center" sx={{ py: 3 }}>
                    {defs?.loading ? <CircularProgress size={20} /> : (
                      <Typography variant="body2" color="text.secondary">No attributes</Typography>
                    )}
                  </Stack>
                )}

                <TablePagination
                  component="div"
                  count={defs?.count || defs?.total || 0}
                  page={Math.max(0, (attrPage - 1))}
                  onPageChange={(_, next) => setAttrPage(next + 1)}
                  rowsPerPage={attrPageSize}
                  onRowsPerPageChange={(e) => { setAttrPageSize(parseInt(e.target.value, 10) || 20); setAttrPage(1); }}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                />
              </Stack>
            </Stack>

          </Stack>
        )}
      </MainCard>
    </>
  );
}

export default CategoryDetail;
