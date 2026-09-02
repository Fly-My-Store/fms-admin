'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Autocomplete,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { enqueueSnackbar } from 'notistack';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';
import { listPromotions } from 'api/promotions';
import {
  attachCampaignPromotions,
  createPromotionCampaign,
  detachCampaignPromotion,
  getPromotionCampaign,
  updatePromotionCampaign
} from 'api/promotionCampaigns';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import { PROMOTION_CAMPAIGN_STATUS_OPTIONS } from 'utils/promotionCampaignLabels';

const EMPTY = {
  name: '',
  slug: '',
  description: '',
  status: 'DRAFT',
  budget_rupees: '',
  max_total_uses: '',
  starts_at: '',
  ends_at: ''
};

function withSelectedOptions(options, selected) {
  const ids = new Set((selected || []).map((s) => s.id));
  const merged = [...(selected || [])];
  for (const o of options || []) {
    if (o?.id && !ids.has(o.id)) merged.push(o);
  }
  return merged;
}

function promoOptionLabel(o) {
  if (!o?.code) return '';
  return o.title ? `${o.code} — ${o.title}` : o.code;
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

function slugify(s = '') {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function PromotionCampaignUpsert() {
  const { id } = useParams();
  const router = useRouter();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [selectedPromos, setSelectedPromos] = useState([]);
  const [initialPromoIds, setInitialPromoIds] = useState([]);

  const promoAttachParams = useMemo(
    () => ({
      for_campaign_attach: '1',
      status: 'ACTIVE',
      limit: 50,
      ...(isEdit && id ? { assignable_to_campaign: id } : { unassigned: '1' })
    }),
    [isEdit, id]
  );
  const promoAc = usePagedAutocomplete(listPromotions, promoAttachParams);

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const loadCampaign = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getPromotionCampaign(id);
      const row = res?.data || res;
      setForm({
        name: row.name || '',
        slug: row.slug || '',
        description: row.description || '',
        status: row.status || 'DRAFT',
        budget_rupees: centsToRupeesInput(row.budget_cents),
        max_total_uses: row.max_total_uses != null ? String(row.max_total_uses) : '',
        starts_at: toDatetimeLocal(row.starts_at),
        ends_at: toDatetimeLocal(row.ends_at)
      });
      const allAttached = row.promotions || [];
      const activePromos = allAttached
        .filter((p) => p.status === 'ACTIVE')
        .map((p) => ({
          id: p.id,
          code: p.code,
          title: p.title,
          status: p.status
        }));
      setSelectedPromos(activePromos);
      setInitialPromoIds(allAttached.map((p) => p.id));
      promoAc.setOptions((prev) => withSelectedOptions(prev, activePromos));
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Failed to load campaign', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  useEffect(() => {
    if (!slugTouched && form.name && !isEdit) {
      setField('slug', slugify(form.name));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, slugTouched, isEdit]);

  const buildPayload = () => ({
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    description: form.description.trim() || null,
    type: 'COUPON',
    status: form.status,
    store_id: null,
    budget_cents: rupeesToCents(form.budget_rupees),
    max_total_uses: form.max_total_uses ? Number(form.max_total_uses) : null,
    starts_at: fromDatetimeLocal(form.starts_at),
    ends_at: fromDatetimeLocal(form.ends_at)
  });

  const onSave = async () => {
    if (!form.name.trim()) {
      enqueueSnackbar('Name is required', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      let campaignId = id;
      const payload = buildPayload();
      if (isEdit) {
        await updatePromotionCampaign(id, payload);
      } else {
        const res = await createPromotionCampaign(payload);
        campaignId = res?.data?.id || res?.id;
      }

      const promoIds = selectedPromos.map((p) => p.id).filter(Boolean);
      if (isEdit) {
        const removed = initialPromoIds.filter((pid) => !promoIds.includes(pid));
        for (const promotionId of removed) {
          // eslint-disable-next-line no-await-in-loop
          await detachCampaignPromotion(campaignId, promotionId);
        }
      }
      if (promoIds.length) {
        await attachCampaignPromotions(campaignId, { promotion_ids: promoIds });
      }

      enqueueSnackbar(isEdit ? 'Campaign updated' : 'Campaign created', { variant: 'success' });
      router.push(`/promotion-campaigns/${campaignId}`);
    } catch (e) {
      enqueueSnackbar(e?.response?.data?.message || 'Save failed', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const breadcrumb = useMemo(
    () => ({
      heading: isEdit ? 'edit-campaign' : 'create-campaign',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'campaigns', to: '/promotion-campaigns' },
        { title: form.name || (isEdit ? id : 'new'), i18n: false }
      ]
    }),
    [form.name, id, isEdit]
  );

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Basics">
            <Stack spacing={2}>
              <TextField
                size="small"
                label="Name"
                required
                fullWidth
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
              <TextField
                size="small"
                label="Slug"
                fullWidth
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setField('slug', e.target.value);
                }}
                helperText="Internal key; auto-generated from name if left blank on create"
              />
              <TextField
                size="small"
                label="Description"
                fullWidth
                multiline
                minRows={2}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
              />
              <TextField
                select
                size="small"
                label="Status"
                fullWidth
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
              >
                {PROMOTION_CAMPAIGN_STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <MainCard title="Budget & schedule">
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Budget (₹)"
                  fullWidth
                  type="number"
                  inputProps={{ min: 0, step: '0.01' }}
                  value={form.budget_rupees}
                  onChange={(e) => setField('budget_rupees', e.target.value)}
                  helperText="Total discount budget across all codes"
                />
                <TextField
                  size="small"
                  label="Max total uses"
                  fullWidth
                  type="number"
                  inputProps={{ min: 1 }}
                  value={form.max_total_uses}
                  onChange={(e) => setField('max_total_uses', e.target.value)}
                  helperText="Cap across all member codes"
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  size="small"
                  label="Starts at"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.starts_at}
                  onChange={(e) => setField('starts_at', e.target.value)}
                />
                <TextField
                  size="small"
                  label="Ends at"
                  type="datetime-local"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.ends_at}
                  onChange={(e) => setField('ends_at', e.target.value)}
                />
              </Stack>
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <MainCard title="Coupon codes">
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                Search and attach active coupon codes only. Create new codes under Promotions first.
              </Typography>
              <Autocomplete
                multiple
                size="small"
                options={withSelectedOptions(
                  promoAc.options.filter((o) => o.status === 'ACTIVE'),
                  selectedPromos
                )}
                value={selectedPromos}
                loading={promoAc.loading}
                getOptionLabel={promoOptionLabel}
                isOptionEqualToValue={(a, b) => a?.id === b?.id}
                onChange={(_, v) => setSelectedPromos(v.filter((o) => o.status === 'ACTIVE'))}
                onInputChange={(_, v, reason) => {
                  if (reason === 'reset') return;
                  promoAc.setQuery(v);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      size="small"
                      label={promoOptionLabel(option)}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Codes"
                    placeholder="Search coupons by code or title…"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {promoAc.loading ? <CircularProgress color="inherit" size={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
                ListboxProps={{ onScroll: promoAc.handleScroll, style: { maxHeight: 280, overflow: 'auto' } }}
              />
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button onClick={() => router.push(isEdit ? `/promotion-campaigns/${id}` : '/promotion-campaigns')} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Update' : 'Create'}
        </Button>
      </Stack>
    </>
  );
}
