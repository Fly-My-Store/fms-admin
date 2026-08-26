'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Autocomplete,
  Button,
  CircularProgress,
  Divider,
  InputLabel,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { enqueueSnackbar } from 'notistack';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import PromotionTargetRow from 'sections/promotions/PromotionTargetRow';
import { createPromotion, getPromotion, updatePromotion } from 'api/promotions';
import { getStore, listStores } from 'api/sellersStores';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import { PROMOTION_STATUS_OPTIONS } from 'utils/promotionLabels';

const EMPTY = {
  title: '',
  code: '',
  description: '',
  discount_type: 'PERCENT',
  discount_value: '10',
  max_discount_rupees: '',
  visibility: 'PUBLIC',
  funding: 'PLATFORM',
  status: 'ACTIVE',
  store_id: '',
  min_cart_rupees: '0',
  max_total_uses: '',
  max_uses_per_user: '',
  starts_at: '',
  ends_at: '',
  targets: []
};

function withSelectedOption(options, selected) {
  if (!selected?.id) return options;
  if (options.some((o) => o?.id === selected.id)) return options;
  return [selected, ...options];
}

function storeOptionLabel(o) {
  if (!o?.name) return '';
  const code = o.code || o.id?.slice?.(0, 8) || '';
  return code ? `${o.name} (${code})` : o.name;
}

function rupeesToCents(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

function centsToRupeesInput(cents) {
  if (cents == null || cents === '') return '';
  return String(Number(cents) / 100);
}

function toDatetimeLocal(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function buildPayload(form) {
  const isFlat = form.discount_type === 'FLAT';
  const isFree = form.discount_type === 'FREE_DELIVERY';
  let discount_value = 0;
  if (isFree) discount_value = 0;
  else if (isFlat) discount_value = rupeesToCents(form.discount_value) || 0;
  else discount_value = Math.trunc(Number(form.discount_value) || 0);

  return {
    title: form.title.trim(),
    code: form.code.trim() || undefined,
    description: form.description.trim() || null,
    discount_type: form.discount_type,
    discount_value,
    max_discount_cents: form.max_discount_rupees === '' ? null : rupeesToCents(form.max_discount_rupees),
    visibility: form.visibility,
    funding: form.funding,
    status: form.status,
    store_id: form.store_id || null,
    min_cart_cents: rupeesToCents(form.min_cart_rupees) || 0,
    max_total_uses: form.max_total_uses === '' ? null : Number(form.max_total_uses),
    max_uses_per_user: form.max_uses_per_user === '' ? null : Number(form.max_uses_per_user),
    starts_at: fromDatetimeLocal(form.starts_at),
    ends_at: fromDatetimeLocal(form.ends_at),
    targets: (form.targets || [])
      .filter((t) => t.target_type && t.target_id)
      .map((t) => ({
        target_type: t.target_type,
        target_id: String(t.target_id).trim()
      }))
  };
}

export default function PromotionUpsert() {
  const { id } = useParams();
  const router = useRouter();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storeSel, setStoreSel] = useState(null);
  const storeAc = usePagedAutocomplete(listStores);

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const hydrate = useCallback(async () => {
    if (!id) {
      setForm(EMPTY);
      setStoreSel(null);
      return;
    }
    setLoading(true);
    try {
      const res = await getPromotion(id);
      const row = res?.data || res;
      const isFlat = row.discount_type === 'FLAT';
      const storeId = row.store_id || row.store?.id || '';
      setForm({
        title: row.title || '',
        code: row.code || '',
        description: row.description || '',
        discount_type: row.discount_type || 'PERCENT',
        discount_value: isFlat ? centsToRupeesInput(row.discount_value) : String(row.discount_value ?? 0),
        max_discount_rupees: centsToRupeesInput(row.max_discount_cents),
        visibility: row.visibility || 'PUBLIC',
        funding: row.funding || 'PLATFORM',
        status: row.status || 'ACTIVE',
        store_id: storeId,
        min_cart_rupees: centsToRupeesInput(row.min_cart_cents) || '0',
        max_total_uses: row.max_total_uses ?? '',
        max_uses_per_user: row.max_uses_per_user ?? '',
        starts_at: toDatetimeLocal(row.starts_at),
        ends_at: toDatetimeLocal(row.ends_at),
        targets: Array.isArray(row.targets)
          ? row.targets.map((t) => ({
              target_type: t.target_type,
              target_id: t.target_id,
              entity: null,
              label: ''
            }))
          : []
      });

      if (row.store?.id) {
        setStoreSel(row.store);
      } else if (storeId) {
        try {
          const storeRes = await getStore(storeId);
          setStoreSel(storeRes?.data || storeRes || null);
        } catch {
          setStoreSel({ id: storeId, name: `Store ${String(storeId).slice(0, 8)}` });
        }
      } else {
        setStoreSel(null);
      }
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e.message || 'Failed to load', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const discountValueLabel =
    form.discount_type === 'PERCENT' ? 'Percent value' : form.discount_type === 'FLAT' ? 'Flat amount (₹)' : 'Value';

  const onSave = async () => {
    if (!form.title.trim()) {
      enqueueSnackbar('Title is required', { variant: 'warning' });
      return;
    }
    const payload = buildPayload(form);
    if (form.discount_type !== 'FREE_DELIVERY' && !(payload.discount_value > 0) && form.discount_type === 'PERCENT') {
      enqueueSnackbar('Discount value must be > 0', { variant: 'warning' });
      return;
    }
    if (form.discount_type === 'FLAT' && !(payload.discount_value > 0)) {
      enqueueSnackbar('Flat amount must be > 0', { variant: 'warning' });
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updatePromotion(id, payload);
        enqueueSnackbar('Promotion updated', { variant: 'success' });
        router.push(`/promotions/${id}`);
      } else {
        const res = await createPromotion(payload);
        const newId = res?.data?.id || res?.id;
        enqueueSnackbar('Promotion created', { variant: 'success' });
        router.push(newId ? `/promotions/${newId}` : '/promotions');
      }
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || e.message || 'Save failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const addTarget = () => {
    setForm((p) => ({
      ...p,
      targets: [
        ...(p.targets || []),
        { target_type: 'CATEGORY', target_id: '', entity: null, label: '' }
      ]
    }));
  };

  const updateTarget = (index, next) => {
    setForm((p) => {
      const targets = [...(p.targets || [])];
      targets[index] = next;
      return { ...p, targets };
    });
  };

  const removeTarget = (index) => {
    setForm((p) => ({
      ...p,
      targets: (p.targets || []).filter((_, i) => i !== index)
    }));
  };

  const breadcrumb = useMemo(() => {
    const name = form.title || (isEdit ? id : 'new');
    return {
      heading: isEdit ? 'edit-promotion' : 'create-promotion',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'promotions', to: '/promotions' },
        { title: name, i18n: false }
      ]
    };
  }, [form.title, id, isEdit]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard border={false} boxShadow>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack flex={1} spacing={2}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Title</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  disabled={loading}
                />
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Code (optional — auto if empty)</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  value={form.code}
                  onChange={(e) => setField('code', e.target.value.toUpperCase())}
                  disabled={loading}
                />
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Description</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  minRows={3}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  disabled={loading}
                />
              </Stack>
            </Stack>

            <Stack flex={1} spacing={2}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Status</InputLabel>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value)}
                  disabled={loading}
                >
                  {PROMOTION_STATUS_OPTIONS.filter((opt) =>
                    isEdit ? true : !['PENDING_APPROVAL', 'REJECTED', 'EXPIRED'].includes(opt.value)
                  ).map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Funding</InputLabel>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={form.funding}
                  onChange={(e) => setField('funding', e.target.value)}
                  disabled={loading}
                  helperText="Who absorbs the discount"
                >
                  <MenuItem value="PLATFORM">Platform</MenuItem>
                  <MenuItem value="SELLER">Seller</MenuItem>
                </TextField>
              </Stack>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Visibility</InputLabel>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={form.visibility}
                  onChange={(e) => setField('visibility', e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="PUBLIC">Public (listed at checkout)</MenuItem>
                  <MenuItem value="PRIVATE">Private (code only)</MenuItem>
                </TextField>
              </Stack>
            </Stack>
          </Stack>

          <Divider />

          <Typography variant="subtitle1">Discount</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>Discount type</InputLabel>
              <TextField
                select
                size="small"
                fullWidth
                value={form.discount_type}
                onChange={(e) => {
                  const next = e.target.value;
                  setForm((p) => ({
                    ...p,
                    discount_type: next,
                    discount_value: next === 'FREE_DELIVERY' ? '0' : next === 'FLAT' ? '20' : '10'
                  }));
                }}
                disabled={loading}
              >
                <MenuItem value="PERCENT">Percent</MenuItem>
                <MenuItem value="FLAT">Flat (₹)</MenuItem>
                <MenuItem value="FREE_DELIVERY">Free delivery (+ km)</MenuItem>
              </TextField>
            </Stack>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>{discountValueLabel}</InputLabel>
              <TextField
                size="small"
                fullWidth
                type="number"
                value={form.discount_value}
                onChange={(e) => setField('discount_value', e.target.value)}
                disabled={loading || form.discount_type === 'FREE_DELIVERY'}
                inputProps={{ min: 0, step: form.discount_type === 'FLAT' ? 0.01 : 1 }}
              />
            </Stack>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>Max discount cap (₹, percent only)</InputLabel>
              <TextField
                size="small"
                fullWidth
                type="number"
                value={form.max_discount_rupees}
                onChange={(e) => setField('max_discount_rupees', e.target.value)}
                disabled={loading || form.discount_type !== 'PERCENT'}
                placeholder="No cap"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Stack>
          </Stack>

          <Divider />

          <Typography variant="subtitle1">Eligibility & limits</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>Store (optional)</InputLabel>
              <Autocomplete
                size="small"
                options={withSelectedOption(storeAc.options, storeSel)}
                value={storeSel}
                loading={storeAc.loading}
                getOptionLabel={storeOptionLabel}
                isOptionEqualToValue={(a, b) => a?.id === b?.id}
                onChange={(_, v) => {
                  setStoreSel(v);
                  setField('store_id', v?.id || '');
                }}
                onInputChange={(_, v, reason) => {
                  if (reason === 'reset') return;
                  storeAc.setQuery(v);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search stores…"
                    helperText="Leave empty for app-wide. Type to search — scroll for more."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {storeAc.loading ? <CircularProgress color="inherit" size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
                ListboxProps={{ onScroll: storeAc.handleScroll, style: { maxHeight: 280, overflow: 'auto' } }}
                disabled={loading}
              />
            </Stack>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>Min cart (₹)</InputLabel>
              <TextField
                size="small"
                fullWidth
                type="number"
                value={form.min_cart_rupees}
                onChange={(e) => setField('min_cart_rupees', e.target.value)}
                disabled={loading}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Stack>
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>Max total uses</InputLabel>
              <TextField
                size="small"
                fullWidth
                type="number"
                value={form.max_total_uses}
                onChange={(e) => setField('max_total_uses', e.target.value)}
                disabled={loading}
                placeholder="Unlimited"
                inputProps={{ min: 1, step: 1 }}
              />
            </Stack>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>Max uses per user</InputLabel>
              <TextField
                size="small"
                fullWidth
                type="number"
                value={form.max_uses_per_user}
                onChange={(e) => setField('max_uses_per_user', e.target.value)}
                disabled={loading}
                placeholder="Unlimited"
                inputProps={{ min: 1, step: 1 }}
              />
            </Stack>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>Starts at</InputLabel>
              <TextField
                size="small"
                fullWidth
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setField('starts_at', e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <Stack flex={1} sx={{ gap: 1 }}>
              <InputLabel>Ends at</InputLabel>
              <TextField
                size="small"
                fullWidth
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setField('ends_at', e.target.value)}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Stack>

          <Divider />

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack spacing={0.5}>
              <Typography variant="subtitle1">Targets (optional)</Typography>
              <Typography variant="caption" color="text.secondary">
                Empty = whole cart / store. Search and select categories, products, or variants.
              </Typography>
            </Stack>
            <Button size="small" startIcon={<PlusOutlined />} onClick={addTarget} disabled={loading}>
              Add target
            </Button>
          </Stack>

          <Stack spacing={1.5}>
            {(form.targets || []).map((t, index) => (
              <PromotionTargetRow
                key={index}
                value={t}
                onChange={(next) => updateTarget(index, next)}
                onRemove={() => removeTarget(index)}
                disabled={loading}
              />
            ))}
            {!form.targets?.length ? (
              <Typography variant="body2" color="text.secondary">
                No targets — applies to all eligible items in scope.
              </Typography>
            ) : null}
          </Stack>

          <Divider />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => router.push(isEdit ? `/promotions/${id}` : '/promotions')} disabled={saving}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onSave} disabled={saving || loading || !form.title.trim()}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </MainCard>
    </>
  );
}
