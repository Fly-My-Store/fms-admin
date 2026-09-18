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
  ToggleButton,
  ToggleButtonGroup,
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
  SURGE_TYPE_LABELS,
  SURGE_WEEKDAY_OPTIONS
} from 'utils/surgeLabels';
import { fromDdMmYyyyHmToIso, parseDdMmYyyyHm, toDdMmYyyyHm } from 'utils/dateFormat';
import { normalizeValidationErrors } from 'utils/formErrors';

const EMPTY = {
  title: '',
  description: '',
  surge_type: 'PERCENT',
  surge_value: '10',
  max_surge_rupees: '50',
  max_cart_rupees: '',
  scope: 'CART',
  surge_beneficiary: 'PLATFORM',
  status: 'ACTIVE',
  store_id: '',
  starts_at: '',
  ends_at: '',
  active_days: [],
  start_time: '',
  end_time: '',
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

function normalizeTimeInput(value) {
  if (!value) return null;
  const raw = String(value).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return undefined;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return undefined;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return undefined;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function toTimeInput(value) {
  const normalized = normalizeTimeInput(value);
  return normalized || '';
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
  const activeDays = Array.isArray(form.active_days)
    ? [...new Set(form.active_days.map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))]
    : [];

  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    surge_type: form.surge_type,
    surge_value,
    max_surge_cents: isFlat
      ? null
      : form.max_surge_rupees === ''
        ? null
        : rupeesToCents(form.max_surge_rupees),
    max_cart_cents: form.max_cart_rupees === '' ? null : rupeesToCents(form.max_cart_rupees),
    scope,
    surge_beneficiary: form.surge_beneficiary,
    status: form.status,
    store_id: form.store_id || null,
    starts_at: fromDdMmYyyyHmToIso(form.starts_at) || null,
    ends_at: fromDdMmYyyyHmToIso(form.ends_at) || null,
    active_days: activeDays.length ? activeDays : null,
    start_time: normalizeTimeInput(form.start_time) || null,
    end_time: normalizeTimeInput(form.end_time) || null,
    targets
  };
}

function validateForm(form) {
  const errors = {};
  if (!form.title?.trim()) errors.title = 'Title is required';
  const value = Number(form.surge_value);
  if (!Number.isFinite(value) || value <= 0) errors.surge_value = 'Enter a positive value';
  if (form.surge_type === 'PERCENT') {
    const cap = Number(form.max_surge_rupees);
    if (!Number.isFinite(cap) || cap <= 0) {
      errors.max_surge_rupees = 'Add a max surge amount for percentage';
    }
  }
  if (form.max_cart_rupees !== '' && form.max_cart_rupees != null) {
    const maxCart = Number(form.max_cart_rupees);
    if (!Number.isFinite(maxCart) || maxCart <= 0) {
      errors.max_cart_rupees = 'Enter a valid max cart amount';
    }
  }
  if (form.scope === 'ITEM') {
    const targets = (form.targets || []).filter((t) => t.target_type && t.target_id);
    if (!targets.length) errors.targets = 'ITEM scope needs at least one target';
  }
  const starts = parseDdMmYyyyHm(form.starts_at);
  const ends = parseDdMmYyyyHm(form.ends_at);
  if (form.starts_at && starts === undefined) errors.starts_at = 'Use DD-MM-YYYY or DD-MM-YYYY HH:mm';
  if (form.ends_at && ends === undefined) errors.ends_at = 'Use DD-MM-YYYY or DD-MM-YYYY HH:mm';
  if (starts && ends && starts >= ends) {
    errors.ends_at = 'End must be after start';
  }
  const startTime = normalizeTimeInput(form.start_time);
  const endTime = normalizeTimeInput(form.end_time);
  if (form.start_time && startTime === undefined) errors.start_time = 'Use HH:mm';
  if (form.end_time && endTime === undefined) errors.end_time = 'Use HH:mm';
  if ((form.start_time || form.end_time) && (!startTime || !endTime)) {
    errors.end_time = errors.end_time || 'Set both start and end hours, or clear both';
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
        max_surge_rupees: isFlat ? '' : centsToRupeesInput(row.max_surge_cents),
        max_cart_rupees: centsToRupeesInput(row.max_cart_cents),
        scope: row.scope || 'CART',
        surge_beneficiary: row.surge_beneficiary || 'PLATFORM',
        status: row.status || 'ACTIVE',
        store_id: storeId,
        starts_at: toDdMmYyyyHm(row.starts_at),
        ends_at: toDdMmYyyyHm(row.ends_at),
        active_days: Array.isArray(row.active_days) ? row.active_days.map(Number) : [],
        start_time: toTimeInput(row.start_time),
        end_time: toTimeInput(row.end_time),
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
                label="Customer message"
                fullWidth
                multiline
                minRows={3}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                disabled={loading}
                helperText="Shown to customers on the store and bill"
              />
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Status & scope">
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
                  fullWidth
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
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  size="small"
                  label="Beneficiary"
                  fullWidth
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
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Surge amount">
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  size="small"
                  label="Type"
                  fullWidth
                  value={form.surge_type}
                  onChange={(e) => {
                    const surge_type = e.target.value;
                    clearError('surge_type');
                    clearError('max_surge_rupees');
                    setForm((p) => ({
                      ...p,
                      surge_type,
                      max_surge_rupees: surge_type === 'PERCENT' ? p.max_surge_rupees || '50' : ''
                    }));
                  }}
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
                  fullWidth
                  value={form.surge_value}
                  onChange={(e) => setField('surge_value', e.target.value)}
                  disabled={loading}
                  error={!!errors.surge_value}
                  helperText={errors.surge_value}
                />
              </Stack>
              {form.surge_type === 'PERCENT' ? (
                <TextField
                  size="small"
                  label="Max surge (₹)"
                  type="number"
                  fullWidth
                  required
                  value={form.max_surge_rupees}
                  onChange={(e) => setField('max_surge_rupees', e.target.value)}
                  disabled={loading}
                  error={!!errors.max_surge_rupees}
                  helperText={errors.max_surge_rupees || 'Required cap for percentage surges'}
                />
              ) : null}
              <TextField
                size="small"
                label="Max cart (₹, optional)"
                type="number"
                fullWidth
                value={form.max_cart_rupees}
                onChange={(e) => setField('max_cart_rupees', e.target.value)}
                disabled={loading}
                error={!!errors.max_cart_rupees}
                helperText={
                  errors.max_cart_rupees ||
                  'Apply only when whole cart (items only) is below this — e.g. 499'
                }
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Starts at (DD-MM-YYYY HH:mm)"
                  fullWidth
                  placeholder="16-09-2026 09:00"
                  value={form.starts_at}
                  onChange={(e) => setField('starts_at', e.target.value)}
                  disabled={loading}
                  error={!!errors.starts_at}
                  helperText={errors.starts_at || 'Optional'}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  size="small"
                  label="Ends at (DD-MM-YYYY HH:mm)"
                  fullWidth
                  placeholder="30-09-2026 23:59"
                  value={form.ends_at}
                  onChange={(e) => setField('ends_at', e.target.value)}
                  disabled={loading}
                  error={!!errors.ends_at}
                  helperText={errors.ends_at || 'Optional'}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Active days (optional — empty = every day, IST)
                </Typography>
                <ToggleButtonGroup
                  size="small"
                  value={form.active_days}
                  onChange={(_e, next) =>
                    setField(
                      'active_days',
                      (next || []).map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
                    )
                  }
                  aria-label="Active days"
                  disabled={loading}
                >
                  {SURGE_WEEKDAY_OPTIONS.map((day) => (
                    <ToggleButton key={day.value} value={day.value} aria-label={day.label}>
                      {day.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="From hour"
                  type="time"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.start_time}
                  onChange={(e) => setField('start_time', e.target.value)}
                  disabled={loading}
                  error={!!errors.start_time}
                  helperText={errors.start_time || 'Leave blank for all day'}
                />
                <TextField
                  size="small"
                  label="To hour"
                  type="time"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.end_time}
                  onChange={(e) => setField('end_time', e.target.value)}
                  disabled={loading}
                  error={!!errors.end_time}
                  helperText={errors.end_time || 'Overnight OK (e.g. 22:00–06:00)'}
                />
              </Stack>
            </Stack>
          </MainCard>
        </Grid>

        {showTargets ? (
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
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            {errors.form ? (
              <Typography variant="body2" color="error" sx={{ mr: 'auto' }}>
                {errors.form}
              </Typography>
            ) : null}
            <Button variant="outlined" onClick={() => router.push('/surges')} disabled={saving}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onSave} disabled={loading || saving}>
              {saving ? <CircularProgress size={18} /> : isEdit ? 'Save' : 'Create'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
