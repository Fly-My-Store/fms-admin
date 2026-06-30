'use client';

import { useEffect, useMemo, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import MainCard from 'components/MainCard';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
// Stable stringify ensures consistent key order so Select value matches MenuItem values
function stableStringify(v) {
  const t = typeof v;
  if (v == null || t !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']';
  const keys = Object.keys(v).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(v[k])).join(',') + '}';
}
import {
  Autocomplete,
  Button,
  CircularProgress,
  FormHelperText,
  InputLabel,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { getVariantAttr, listCategoryAttrs, listDefs, upsertVariantAttr } from 'api/attributes';
import { RECORD_STATUS_ARRAY } from 'utils/constants';

const STATUS_LIST = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'DISABLED'];

export default function ProductVariantAttributeUpsert() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const { id: attributeCode } = useParams();
  const variantId = search?.get('v');
  const variantName = search?.get('n');
  const category_id = search?.get('c');
  const isEdit = !!attributeCode;

  const [defs, setDefs] = useState([]);
  const [defsLoading, setDefsLoading] = useState(false);
  const [defQuery, setDefQuery] = useState('');
  const [defSel, setDefSel] = useState(null);

  const [form, setForm] = useState({
    variant_id: variantId || '',
    attribute_code: attributeCode || '',
    data_type: '',
    allowed_values: null,
    value_text: '',
    value_int: '',
    value_decimal: '',
    value_bool: null,
    value_json: '',
    normalized_num: '',
    normalized_unit: '',
    record_status: 1
  });

  // Reset form when attributeCode is cleared (navigating to create)
  useEffect(() => {
    if (!attributeCode) {
      setForm({
        variant_id: variantId || '',
        attribute_code: '',
        data_type: '',
        allowed_values: null,
        value_text: '',
        value_int: '',
        value_decimal: '',
        value_bool: null,
        value_json: '',
        normalized_num: '',
        normalized_unit: '',
        record_status: 1
      });
      setDefSel(null);
    }
  }, [attributeCode, variantId]);

  const breadcrumb = useMemo(
    () => ({
      heading: isEdit ? 'edit-variant-attribute' : 'create-variant-attribute',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'product-variants', to: '/product-variants' },
        { title: variantName, to: `/variants/${variantId}`, i18n: false },
        { title: isEdit ? attributeCode : 'create-variant-attribute', i18n: false }
      ]
    }),
    [variantId, attributeCode, isEdit]
  );

  // ---- Load in EDIT mode ----
  useEffect(() => {
    async function loadForEdit() {
      try {
        const res = await getVariantAttr(attributeCode, variantId);
        const row = res?.data;
        console.log('Loaded attribute for edit:', row); // Debug log
        setForm({
          variant_id: row?.variant_id || '',
          attribute_code: row?.attributeDef?.code || '',
          data_type: row?.attributeDef?.data_type || '',
          allowed_values: Array.isArray(row?.attributeDef?.allowed_values) ? row.attributeDef.allowed_values : null,
          value_text: row?.value_text ?? '',
          value_int: row?.value_int != null && row?.value_int !== '' ? Number(row.value_int) : '',
          value_decimal: row?.value_decimal != null && row?.value_decimal !== '' ? Number(row.value_decimal) : '',
          value_bool: row?.value_bool ?? null,
          value_json: row?.value_json ? stableStringify(row.value_json) : '',
          normalized_num: row?.normalized_num ?? '',
          normalized_unit: row?.normalized_unit ?? '',
          record_status: row?.record_status || 1
        });
      } catch (e) {
        enqueueSnackbar('Failed to load attribute', { variant: 'error' });
      }
    }
    if (isEdit && variantId && attributeCode) loadForEdit();
  }, [isEdit, variantId, attributeCode]);

  // ---- Load defs in CREATE mode ----
  useEffect(() => {
    async function loadDefs() {
      if (isEdit) return; // not needed
      try {
        setDefsLoading(true);
        const res = await listCategoryAttrs({ q: defQuery, category_id, limit: 20 });
        const rows = res?.data || res?.data?.rows || [];
        setDefs(rows.map((r) => ({ ...r.attributeDef, is_variant_axis: r.is_variant_axis })));
      } catch (e) {
        setDefs([]);
        enqueueSnackbar('Failed to load attribute defs', { variant: 'error' });
      } finally {
        setDefsLoading(false);
      }
    }
    loadDefs();
  }, [isEdit, defQuery, variantId]);

  const onDefChange = (_, v) => {
    setDefSel(v);
    setForm((p) => ({
      ...p,
      attribute_code: v?.code || '',
      data_type: v?.data_type || '',
      allowed_values: v?.allowed_values || null,
      // reset value fields when switching def
      value_text: '',
      value_int: '',
      value_decimal: '',
      value_bool: null,
      value_json: '',
      normalized_num: '',
      normalized_unit: v.unit || ''
    }));
  };

  const handleField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit() {
    try {
      const coerceByKind = (kind, v) => {
        switch (kind) {
          case 'json':
            return typeof v === 'string' ? v : JSON.stringify(v);
          case 'bool':
            return typeof v === 'boolean' ? v : String(v).toLowerCase() === 'true';
          case 'decimal':
          case 'int':
            return Number(v);
          case 'text':
          default:
            return String(v);
        }
      };

      const normalizeAllowedList = (kind, arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.map((x) => coerceByKind(kind, x));
      };

      const payload = { record_status: form.record_status, variant_id: form.variant_id, attributeCode: form.attribute_code };

      // Value-driven inference (independent of data_type):
      // Priority: JSON > Bool (when chosen) > Decimal > Int > Text
      let pickedKind = null;
      let pickedVal = null;

      const jsonStr = (form.value_json || '').trim();
      if (jsonStr !== '') {
        try {
          const parsed = JSON.parse(jsonStr);
          payload.value_json = parsed;
          pickedKind = 'json';
          pickedVal = parsed;
        } catch {
          return enqueueSnackbar('Invalid JSON', { variant: 'warning' });
        }
      } else if (form.value_bool !== null) {
        payload.value_bool = !!form.value_bool;
        pickedKind = 'bool';
        pickedVal = !!form.value_bool;
      } else if (form.value_decimal !== '') {
        const n = Number(form.value_decimal);
        if (Number.isNaN(n)) return enqueueSnackbar('Decimal must be a number', { variant: 'warning' });
        payload.value_decimal = n;
        pickedKind = 'decimal';
        pickedVal = n;
      } else if (form.value_int !== '') {
        const n = Number(form.value_int);
        if (!Number.isInteger(n)) return enqueueSnackbar('Integer must be an integer', { variant: 'warning' });
        payload.value_int = n;
        pickedKind = 'int';
        pickedVal = n;
      } else if ((form.value_text || '').trim() !== '') {
        const t = form.value_text.trim();
        payload.value_text = t;
        pickedKind = 'text';
        pickedVal = t;
      } else {
        return enqueueSnackbar('Provide a value', { variant: 'warning' });
      }

      const valuesMatchAllowed = (allowedVal, pickedVal, kind) => {
        if (kind === 'json') return String(allowedVal) === String(pickedVal);
        if (kind === 'bool') return !!allowedVal === !!pickedVal;
        if (kind === 'int' || kind === 'decimal') {
          return Number(allowedVal) === Number(pickedVal);
        }
        return String(allowedVal).trim() === String(pickedVal).trim();
      };

      if (Array.isArray(form.allowed_values) && form.allowed_values.length > 0) {
        const allowed = normalizeAllowedList(pickedKind || form.data_type || 'text', form.allowed_values);
        const pickedCoerced = coerceByKind(pickedKind || form.data_type || 'text', pickedVal);
        const match = allowed.some((av) => valuesMatchAllowed(av, pickedCoerced, pickedKind || form.data_type || 'text'));
        if (!match) {
          return enqueueSnackbar('Value must be one of the allowed values', { variant: 'warning' });
        }
      }

      // Normalization (optional numeric canonicalization)
      if (form.normalized_num !== '') {
        const nn = Number(form.normalized_num);
        if (Number.isNaN(nn)) return enqueueSnackbar('Normalized number must be numeric', { variant: 'warning' });
        payload.normalized_num = nn;
      }
      if ((form.normalized_unit || '').trim() !== '') {
        payload.normalized_unit = form.normalized_unit.trim();
      }
      console.log('Submitting payload:', payload); // Debug log
      console.log('form', form); // Debug log
      await upsertVariantAttr(payload.attributeCode, payload);
      if (isEdit) {
        enqueueSnackbar('Attribute updated', { variant: 'success' });
      } else {
        enqueueSnackbar('Attribute added', { variant: 'success' });
      }
      router.back();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to save attribute';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  }

  const renderValueInput = () => {
    const hasAllowed = Array.isArray(form.allowed_values) && form.allowed_values.length > 0;

    // Helpers to coerce allowed_values into typed payloads
    const asBool = (v) => (typeof v === 'boolean' ? v : String(v).toLowerCase() === 'true');
    const asInt = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.trunc(n) : '';
    };
    const asDec = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : '';
    };
    const toJsonString = (v) => {
      try {
        return typeof v === 'string' ? v : JSON.stringify(v);
      } catch {
        return '';
      }
    };
    console.log('Rendering value input, form:', form); // Debug log
    if (hasAllowed) {
      // Show a SELECT but bind to the correct value_* based on data_type
      switch (form.data_type) {
        case 'bool': {
          // Restrict to allowed boolean values if provided; fall back to true/false
          const opts = form.allowed_values.length
            ? [...new Set(form.allowed_values.map(asBool))]
            : [true, false];
          return (
            <>
              <InputLabel>Allowed Value</InputLabel>
              <TextField
                select
                size="small"
                fullWidth
                value={form.value_bool === true ? 'true' : form.value_bool === false ? 'false' : ''}
                onChange={(e) => {
                  const v = e.target.value;
                  handleField('value_bool', v === 'true' ? true : v === 'false' ? false : null);
                }}
              >
                <MenuItem value="">—</MenuItem>
                {opts.map((v, i) => (
                  <MenuItem key={`bool-${i}`} value={v ? 'true' : 'false'}>
                    {String(v)}
                  </MenuItem>
                ))}
              </TextField>
            </>
          );
        }
        case 'int': {
          return (
            <>
              <InputLabel>Allowed Value</InputLabel>
              <TextField
                select
                size="small"
                fullWidth
                value={form.value_int === '' || form.value_int === null ? '' : String(form.value_int)}
                onChange={(e) => {
                  const n = asInt(e.target.value);
                  handleField('value_int', n === '' ? '' : n);
                }}
              >
                <MenuItem value="">—</MenuItem>
                {form.allowed_values.map((v, i) => (
                  <MenuItem key={`int-${i}`} value={String(v)}>
                    {String(v)}
                  </MenuItem>
                ))}
              </TextField>
            </>
          );
        }
        case 'decimal': {
          return (
            <>
              <InputLabel>Allowed Value</InputLabel>
              <TextField
                select
                size="small"
                fullWidth
                value={form.value_decimal === '' || form.value_decimal === null ? '' : String(form.value_decimal)}
                onChange={(e) => {
                  const n = asDec(e.target.value);
                  handleField('value_decimal', n === '' ? '' : n);
                }}
              >
                <MenuItem value="">—</MenuItem>
                {form.allowed_values.map((v, i) => (
                  <MenuItem key={`dec-${i}`} value={String(v)}>
                    {String(v)}
                  </MenuItem>
                ))}
              </TextField>
            </>
          );
        }
        case 'json': {
          const items = (form.allowed_values || []).map((v, i) => {
            const s = typeof v === 'string' ? v : stableStringify(v);
            return { key: `${i}-${s}`, value: s, label: s };
          });
          return (
            <>
              <InputLabel>Allowed Value</InputLabel>
              <TextField
                select
                size="small"
                fullWidth
                value={form.value_json || ''}
                onChange={(e) => handleField('value_json', e.target.value)}
                SelectProps={{
                  renderValue: (val) => (val ? val : '—')
                }}
              >
                <MenuItem value="">—</MenuItem>
                {items.map((o) => (
                  <MenuItem key={o.key} value={o.value} sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
            </>
          );
        }
        case 'text':
        default: {
          return (
            <>
              <InputLabel>Allowed Value</InputLabel>
              <TextField
                select
                size="small"
                fullWidth
                value={form.value_text || ''}
                onChange={(e) => handleField('value_text', e.target.value)}
              >
                <MenuItem value="">—</MenuItem>
                {form.allowed_values.map((v, i) => (
                  <MenuItem key={`txt-${i}`} value={String(v)}>
                    {String(v)}
                  </MenuItem>
                ))}
              </TextField>
            </>
          );
        }
      }
    }

    // No allowed values → fall back to free-form input by data_type
    switch (form.data_type) {
      case 'text':
        return (
          <>
            <InputLabel>Value (text)</InputLabel>
            <TextField
              size="small"
              fullWidth
              value={form.value_text || ''}
              onChange={(e) => handleField('value_text', e.target.value)}
            />
          </>
        );
      case 'int':
        return (
          <>
            <InputLabel>Value (integer)</InputLabel>
            <TextField
              size="small"
              type="number"
              fullWidth
              value={form.value_int || ''}
              onChange={(e) => handleField('value_int', e.target.value)}
            />
          </>
        );
      case 'decimal':
        return (
          <>
            <InputLabel>Value (decimal)</InputLabel>
            <TextField
              size="small"
              type="number"
              fullWidth
              value={form.value_decimal || ''}
              onChange={(e) => handleField('value_decimal', e.target.value)}
            />
          </>
        );
      case 'bool':
        return (
          <>
            <InputLabel>Value (boolean)</InputLabel>
            <TextField
              select
              size="small"
              fullWidth
              value={form.value_bool === true ? 'true' : form.value_bool === false ? 'false' : ''}
              onChange={(e) => {
                const v = e.target.value;
                handleField('value_bool', v === 'true' ? true : v === 'false' ? false : null);
              }}
            >
              <MenuItem value="">—</MenuItem>
              <MenuItem value="true">true</MenuItem>
              <MenuItem value="false">false</MenuItem>
            </TextField>
          </>
        );
      case 'json':
        return (
          <>
            <InputLabel>Value (JSON)</InputLabel>
            <TextField
              size="small"
              fullWidth
              multiline
              minRows={4}
              value={form.value_json || ''}
              onChange={(e) => handleField('value_json', e.target.value)}
              inputProps={{
                style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }
              }}
            />
          </>
        );
      default:
        return (
          <Typography variant="body2" color="text.secondary">
            {isEdit ? 'No attribute type found.' : 'Select an attribute to set value.'}
          </Typography>
        );
    }
  };

  return (
    <>
      <Breadcrumbs custom heading={isEdit ? 'edit-variant-attribute' : 'create-variant-attribute'} links={breadcrumb.links} />
      <MainCard border={false} boxShadow>
        <Stack spacing={2} maxWidth={720}>
          {/* Attribute selector or static code */}
          {isEdit ? (
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Attribute Code</InputLabel>
              <TextField size="small" fullWidth disabled value={form.attribute_code} />
            </Stack>
          ) : (
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Attribute</InputLabel>
              <Autocomplete
                options={defs}
                loading={defsLoading}
                onChange={onDefChange}
                getOptionLabel={(o) => {
                  const base = o?.name ? `${o.name} (${o.code})` : o?.code || '';
                  return o?.is_variant_axis ? `${base} · Picker` : base;
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Search attribute…"
                    onChange={(e) => setDefQuery(e.target.value)}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {defsLoading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
              {!form.attribute_code && (
                <FormHelperText>Select an attribute to continue.</FormHelperText>
              )}
            </Stack>
          )}

          {renderValueInput()}

          <Stack direction="row" spacing={2}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Normalized Number</InputLabel>
              <TextField
                size="small"
                fullWidth
                type="number"
                value={form.normalized_num || ''}
                onChange={(e) => handleField('normalized_num', e.target.value)}
              />
            </Stack>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Normalized Unit</InputLabel>
              <TextField
                size="small"
                fullWidth
                value={form.normalized_unit || ''}
                onChange={(e) => handleField('normalized_unit', e.target.value)}
              />
            </Stack>
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Record Status</InputLabel>
            <TextField
              select
              size="small"
              fullWidth
              value={form.record_status}
              onChange={(e) => handleField('record_status', e.target.value)}
            >
              {RECORD_STATUS_ARRAY.map((r) => (
                <MenuItem key={r.key} value={r.key}>
                  {r.value}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => router.push(`/variants/${variantId}`)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!isEdit && !form.attribute_code}
            >
              {isEdit ? 'Save' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </MainCard>
    </>
  );
}
