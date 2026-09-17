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
import { createSurge, getSurge, updateSurge } from 'api/surges';
import { getStore, listStores } from 'api/sellersStores';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import {
  SURGE_BENEFICIARY_LABELS,
  SURGE_SCOPE_LABELS,
  SURGE_STATUS_OPTIONS,
  SURGE_TYPE_LABELS
} from 'utils/surgeLabels';
import { normalizeValidationErrors } from 'utils/formErrors';

const EMPTY = {
  title: '',
  description: '',
  surge_type: 'PERCENT',
  surge_value: '10',
  scope: 'CART',
  surge_beneficiary: 'PLATFORM',
  status: 'ACTIVE',
  store_id: '',
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
  const isFlat = form.surge_type === 'FLAT';
  const surge_value = isFlat
    ? rupeesToCents(form.surge_value) || 0
    : Math.trunc(Number(form.surge_value) || 0);
  const scope = form.scope || 'CART';
  const targets =
    scope === 'ITEM'
      ? (form.targets || [])
          .filter((t) => t.target_type && t.target_id)
          .map((t) => ({
            target_type: t.target_type,
            target_id: String(t.target_id).trim()
          }))
      : [];

  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    surge_type: form.surge_type,
    surge_value,
    scope,
    surge_beneficiary: form.surge_beneficiary,
    status: form.status,
    store_id: form.store_id || null,
    starts_at: fromDatetimeLocal(form.starts_at),
    ends_at: fromDatetimeLocal(form.ends_at),
    targets
  };
}

function validateForm(form) {
  const errors = {};
  if (!form.title?.trim()) errors.title = 'Title is required';
  const value = Number(form.surge_value);
  if (!Number.isFinite(value) || value <= 0) errors.surge_value = 'Enter a positive value';
  if (form.scope === 'ITEM') {
    const targets = (form.targets || []).filter((t) => t.target_type && t.target_id);
    if (!targets.length) errors.targets = 'ITEM scope needs at least one target';
  }
  if (form.starts_at && form.ends_at && new Date(form.starts_at) >= new Date(form.ends_at)) {
    errors.ends_at = 'End must be after start';
  }
  return { ok: !Object.keys(errors).length, errors };
}

export default function SurgeUpsert() {
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
      const res = await getSurge(id);
      const row = res?.data || res;
      const isFlat = row.surge_type === 'FLAT';
      const storeId = row.store_id || row.store?.id || '';
      setForm({
        title: row.title || '',
        description: row.description || '',
        surge_type: row.surge_type || 'PERCENT',
        surge_value: isFlat ? centsToRupeesInput(row.surge_value) : String(row.surge_value ?? 0),
        scope: row.scope || 'CART',
        surge_beneficiary: row.surge_beneficiary || 'PLATFORM',
        status: row.status || 'ACTIVE',
        store_id: storeId,
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

  const onSave = async () => {
    const result = validateForm(form);
    if (!result.ok) {
      setErrors(result.errors || {});
      return;
    }

    const payload = buildPayload(form);
    setSaving(true);
    try {
      if (isEdit) {
        await updateSurge(id, payload);
        enqueueSnackbar('Surge updated', { variant: 'success' });
        router.push(`/surges/${id}`);
      } else {
        const res = await createSurge(payload);
        const newId = res?.data?.id || res?.id;
        enqueueSnackbar('Surge created', { variant: 'success' });
        router.push(newId ? `/surges/${newId}` : '/surges');
      }
    } catch (e) {
      const response = e?.response?.data;
      const { message, errors: apiErrors } = normalizeValidationErrors(response || {});
      if (apiErrors && Object.keys(apiErrors).length) {
        setErrors(apiErrors);
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
      targets: [...(p.targets || []), { target_type: 'CATEGORY', target_id: '', entity: null, label: '' }]
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
      heading: isEdit ? 'edit-surge' : 'create-surge',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'surges', to: '/surges' },
        { title: name, i18n: false }
      ]
    };
  }, [form.title, id, isEdit]);

  const showTargets = form.scope === 'ITEM';

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Basics">
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Title"
                required
                fullWidth
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                disabled={loading}
                error={!!errors.title}
                helperText={errors.title}
              />
              <TextField
                size="small"
                label="Description"
                fullWidth
                multiline
                minRows={3}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                disabled={loading}
              />
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Status & scope">
            <Stack spacing={2}>
              <TextField
                select
                size="small"
                label="Status"
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                disabled={loading}
              >
                {SURGE_STATUS_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Scope"
                value={form.scope}
                onChange={(e) => {
                  const scope = e.target.value;
                  clearError('scope');
                  clearError('targets');
                  setForm((p) => ({
                    ...p,
                    scope,
                    targets: scope === 'ITEM' ? p.targets : []
                  }));
                }}
                disabled={loading}
              >
                {Object.entries(SURGE_SCOPE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Beneficiary"
                value={form.surge_beneficiary}
                onChange={(e) => setField('surge_beneficiary', e.target.value)}
                disabled={loading}
              >
                {Object.entries(SURGE_BENEFICIARY_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
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
                    label="Store (optional)"
                    placeholder="App-wide if empty"
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
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Surge amount">
            <Stack spacing={2}>
              <TextField
                select
                size="small"
                label="Type"
                value={form.surge_type}
                onChange={(e) => setField('surge_type', e.target.value)}
                disabled={loading}
              >
                {Object.entries(SURGE_TYPE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label={form.surge_type === 'FLAT' ? 'Flat amount (₹)' : 'Percent value'}
                type="number"
                value={form.surge_value}
                onChange={(e) => setField('surge_value', e.target.value)}
                disabled={loading}
                error={!!errors.surge_value}
                helperText={errors.surge_value}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Starts at"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.starts_at}
                  onChange={(e) => setField('starts_at', e.target.value)}
                  disabled={loading}
                />
                <TextField
                  size="small"
                  label="Ends at"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.ends_at}
                  onChange={(e) => setField('ends_at', e.target.value)}
                  disabled={loading}
                  error={!!errors.ends_at}
                  helperText={errors.ends_at}
                />
              </Stack>
            </Stack>
          </MainCard>
        </Grid>

        {showTargets ? (
          <Grid size={{ xs: 12 }}>
            <MainCard
              title="Targets"
              secondary={
                <Button size="small" startIcon={<PlusOutlined />} onClick={addTarget} disabled={loading}>
                  Add target
                </Button>
              }
            >
              <Stack spacing={1.5}>
                {(form.targets || []).map((target, index) => (
                  <PromotionTargetRow
                    key={`${index}-${target.target_type}-${target.target_id || 'new'}`}
                    value={target}
                    onChange={(next) => updateTarget(index, next)}
                    onRemove={() => removeTarget(index)}
                    disabled={loading}
                  />
                ))}
                {errors.targets ? (
                  <Typography variant="caption" color="error">
                    {errors.targets}
                  </Typography>
                ) : null}
                {!form.targets?.length ? (
                  <Typography variant="body2" color="text.secondary">
                    ITEM scope requires at least one brand, category, product, or variant target.
                  </Typography>
                ) : null}
              </Stack>
            </MainCard>
          </Grid>
        ) : null}

        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" onClick={onSave} disabled={loading || saving}>
              {saving ? <CircularProgress size={18} /> : isEdit ? 'Save' : 'Create'}
            </Button>
            <Button variant="outlined" onClick={() => router.push('/surges')} disabled={saving}>
              Cancel
            </Button>
            {errors.form ? (
              <Typography variant="body2" color="error">
                {errors.form}
              </Typography>
            ) : null}
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
