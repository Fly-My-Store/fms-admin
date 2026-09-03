'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Autocomplete,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { PlusOutlined } from '@ant-design/icons';
import { enqueueSnackbar } from 'notistack';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import PromotionTargetRow from 'sections/promotions/PromotionTargetRow';
import { createPromotion, getPromotion, updatePromotion } from 'api/promotions';
import { getStore, listStores } from 'api/sellersStores';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import { PROMOTION_STATUS_OPTIONS } from 'utils/promotionLabels';
import { normalizeValidationErrors } from 'utils/formErrors';
import {
  firstAdminPromotionError,
  mapAdminPromotionApiErrors,
  validateAdminPromotionForm
} from 'utils/promotionValidation';

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storeSel, setStoreSel] = useState(null);
  const storeAc = usePagedAutocomplete(listStores);

  const clearError = (name) => {
    setErrors((prev) => {
      if (!prev?.[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const setField = (name, value) => {
    clearError(name);
    setForm((p) => ({ ...p, [name]: value }));
  };

  const hydrate = useCallback(async () => {
    if (!id) {
      setForm(EMPTY);
      setStoreSel(null);
      setErrors({});
      return;
    }
    setLoading(true);
    setErrors({});
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
              entity: t.label ? { id: t.target_id, name: t.label } : null,
              label: t.label || ''
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

  const formErrorMessage = useMemo(() => {
    if (!errors || !Object.keys(errors).length) return '';
    return firstAdminPromotionError(errors, '');
  }, [errors]);

  const onSave = async () => {
    const result = validateAdminPromotionForm(form, { mode: isEdit ? 'edit' : 'create' });
    if (!result.ok) {
      setErrors(result.errors || {});
      return;
    }

    const payload = buildPayload(form);
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
      const response = e?.response?.data;
      const { message, errors: apiErrors } = normalizeValidationErrors(response || {});
      const mapped = mapAdminPromotionApiErrors(apiErrors);
      if (Object.keys(mapped).length) {
        setErrors(mapped);
      } else if (message) {
        setErrors({ form: message });
      } else {
        setErrors({ form: e?.message || 'Save failed' });
      }
    } finally {
      setSaving(false);
    }
  };

  const addTarget = () => {
    clearError('targets');
    setForm((p) => ({
      ...p,
      targets: [
        ...(p.targets || []),
        { target_type: 'CATEGORY', target_id: '', entity: null, label: '' }
      ]
    }));
  };

  const updateTarget = (index, next) => {
    clearError('targets');
    setForm((p) => {
      const targets = [...(p.targets || [])];
      targets[index] = next;
      return { ...p, targets };
    });
  };

  const removeTarget = (index) => {
    clearError('targets');
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
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Basics" >
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Title"
                  required
                  fullWidth
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  disabled={loading}
                  error={!!errors.title}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Code"
                  fullWidth
                  value={form.code}
                  onChange={(e) => setField('code', e.target.value.toUpperCase())}
                  disabled={loading}
                  error={!!errors.code}
                  sx={{ flex: 1 }}
                />
              </Stack>
              <TextField
                size="small"
                label="Description"
                fullWidth
                multiline
                minRows={3}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                disabled={loading}
                error={!!errors.description}
              />
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Status & scope" >
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  size="small"
                  label="Status"
                  fullWidth
                  value={form.status}
                  onChange={(e) => setField('status', e.target.value)}
                  disabled={loading}
                  error={!!errors.status}
                  sx={{ flex: 1 }}
                >
                  {PROMOTION_STATUS_OPTIONS.filter((opt) =>
                    isEdit ? true : !['PENDING_APPROVAL', 'REJECTED', 'EXPIRED'].includes(opt.value)
                  ).map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Funding"
                  fullWidth
                  value={form.funding}
                  onChange={(e) => setField('funding', e.target.value)}
                  disabled={loading}
                  error={!!errors.funding}
                  sx={{ flex: 1 }}
                >
                  <MenuItem value="PLATFORM">Platform</MenuItem>
                  <MenuItem value="SELLER">Seller</MenuItem>
                </TextField>
              </Stack>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4, md: 3.6 }}>
                  <TextField
                    select
                    size="small"
                    label="Visibility"
                    fullWidth
                    value={form.visibility}
                    onChange={(e) => setField('visibility', e.target.value)}
                    disabled={loading}
                    error={!!errors.visibility}
                  >
                    <MenuItem value="PUBLIC">Public (listed at checkout)</MenuItem>
                    <MenuItem value="PRIVATE">Private (code only)</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 8, md: 8.4 }}>
                  <Autocomplete
                    size="small"
                    fullWidth
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
                        label="Store"
                        placeholder="Search stores…"
                        error={!!errors.store_id}
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
                </Grid>
              </Grid>
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Discount" >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                size="small"
                label="Discount type"
                fullWidth
                value={form.discount_type}
                onChange={(e) => {
                  const next = e.target.value;
                  clearError('discount_type');
                  clearError('discount_value');
                  clearError('max_discount_rupees');
                  setForm((p) => ({
                    ...p,
                    discount_type: next,
                    discount_value: next === 'FREE_DELIVERY' ? '0' : next === 'FLAT' ? '20' : '10'
                  }));
                }}
                disabled={loading}
                error={!!errors.discount_type}
                sx={{ flex: 1 }}
              >
                <MenuItem value="PERCENT">Percent</MenuItem>
                <MenuItem value="FLAT">Flat (₹)</MenuItem>
                <MenuItem value="FREE_DELIVERY">Free delivery (+ km)</MenuItem>
              </TextField>
              <TextField
                size="small"
                label={discountValueLabel}
                fullWidth
                type="number"
                value={form.discount_value}
                onChange={(e) => setField('discount_value', e.target.value)}
                disabled={loading || form.discount_type === 'FREE_DELIVERY'}
                error={!!errors.discount_value}
                inputProps={{ min: 0, step: form.discount_type === 'FLAT' ? 0.01 : 1 }}
                sx={{ flex: 1 }}
              />
              <TextField
                size="small"
                label="Max discount cap (₹)"
                fullWidth
                type="number"
                value={form.max_discount_rupees}
                onChange={(e) => setField('max_discount_rupees', e.target.value)}
                disabled={loading || form.discount_type !== 'PERCENT'}
                placeholder="No cap"
                error={!!errors.max_discount_rupees}
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ flex: 1 }}
              />
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Eligibility & limits" >
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Min cart (₹)"
                  fullWidth
                  type="number"
                  value={form.min_cart_rupees}
                  onChange={(e) => setField('min_cart_rupees', e.target.value)}
                  disabled={loading}
                  error={!!errors.min_cart_rupees}
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Max total uses"
                  fullWidth
                  type="number"
                  value={form.max_total_uses}
                  onChange={(e) => setField('max_total_uses', e.target.value)}
                  disabled={loading}
                  placeholder="Unlimited"
                  error={!!errors.max_total_uses}
                  inputProps={{ min: 1, step: 1 }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Max uses / user"
                  fullWidth
                  type="number"
                  value={form.max_uses_per_user}
                  onChange={(e) => setField('max_uses_per_user', e.target.value)}
                  disabled={loading}
                  placeholder="Unlimited"
                  error={!!errors.max_uses_per_user}
                  inputProps={{ min: 1, step: 1 }}
                  sx={{ flex: 1 }}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Starts at"
                  fullWidth
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setField('starts_at', e.target.value)}
                  disabled={loading}
                  error={!!errors.starts_at}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Ends at"
                  fullWidth
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(e) => setField('ends_at', e.target.value)}
                  disabled={loading}
                  error={!!errors.ends_at}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
              </Stack>
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard
            title="Targets"
            secondary={
              <Button size="small" startIcon={<PlusOutlined />} onClick={addTarget} disabled={loading}>
                Add target
              </Button>
            }
          >
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
          </MainCard>
        </Grid>

        <Grid size={12}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
            {formErrorMessage ? (
              <Typography variant="body2" color="error" sx={{ maxWidth: 420, textAlign: 'right' }}>
                {formErrorMessage}
              </Typography>
            ) : null}
            <Button onClick={() => router.push(isEdit ? `/promotions/${id}` : '/promotions')} disabled={saving}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onSave} disabled={saving || loading}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
