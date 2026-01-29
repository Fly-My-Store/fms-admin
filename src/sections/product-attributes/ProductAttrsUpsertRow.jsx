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
  IconButton,
  Tooltip,
  CircularProgress,
  FormHelperText,
  InputLabel,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { getProductAttr, listDefs, upsertProductAttr } from 'api/attributes';
import { CheckCircleFilled, CloseCircleFilled, CloseOutlined, DeleteFilled, PlusCircleFilled } from '@ant-design/icons';

const STATUS_LIST = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'DISABLED'];

export default function ProductAttrsUpsertRow({ productId, row, defs, defsLoading, setDefQuery }) {
  const router = useRouter();
  const attribute_code = row.attribute_code;
  const isEdit = !!attribute_code;

  const [form, setForm] = useState({
    product_id: productId || '',
    attribute_code: attribute_code || '',
    data_type: '',
    allowed_values: null,
    value_text: '',
    value_int: '',
    value_decimal: '',
    value_bool: null,
    value_json: '',
    normalized_num: '',
    normalized_unit: '',
    status: 'DRAFT'
  });

  // Memoized selector for the currently chosen attribute definition
  const selectedDef = useMemo(() => {
    if (!defs || !Array.isArray(defs)) return null;
    const code =
      form?.attribute_code ||
      row?.attributeDef?.code ||
      row?.attribute_code ||
      '';
    return defs.find((d) => d?.code === code) || null;
  }, [defs, form?.attribute_code, row]);

  // ---- Load in EDIT mode ----
  useEffect(() => {
    async function loadForEdit() {
      try {
        setForm(prev => {
          return {
            product_id: row?.product_id || '',
            attribute_code: row?.attributeDef?.code || '',
            data_type: row?.attributeDef?.data_type || '',
            allowed_values: Array.isArray(row?.attributeDef?.allowed_values) ? row.attributeDef.allowed_values : null,
            value_text: row?.value_text ?? '',
            value_int: row?.value_int ?? '',
            value_decimal: row?.value_decimal ?? '',
            value_bool: row?.value_bool ?? null,
            value_json: row?.value_json ? stableStringify(row.value_json) : '',
            normalized_num: row?.normalized_num ?? '',
            normalized_unit: row?.normalized_unit ?? '',
            status: row?.status || 'DRAFT'
          }
        });
      } catch (e) {
        enqueueSnackbar('Failed to load attribute', { variant: 'error' });
      }
    }
    if (isEdit && row) loadForEdit();

  }, [isEdit, row]);

  const onDefChange = (_, v) => {
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

  async function handleRemove() { }

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

      const payload = { status: form.status, product_id: form.product_id, attributeCode: form.attribute_code };

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

      if (Array.isArray(form.allowed_values) && form.allowed_values.length > 0) {
        const allowed = normalizeAllowedList(pickedKind || 'text', form.allowed_values);
        const pickedCoerced = coerceByKind(pickedKind || 'text', pickedVal);
        // For JSON, compare by stringified form
        const match = allowed.some((av) => {
          if (pickedKind === 'json') return String(av) === String(pickedCoerced);
          return av === pickedCoerced;
        });
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
      await upsertProductAttr(payload.attributeCode, payload);
      if (isEdit) {
        enqueueSnackbar('Attribute updated', { variant: 'success' });
      } else {
        enqueueSnackbar('Attribute added', { variant: 'success' });
      }
      router.push(`/products/${productId}`);
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

    if (hasAllowed) {
      // Show a SELECT but bind to the correct value_* based on data_type
      switch (form.data_type) {
        case 'bool': {
          // Restrict to allowed boolean values if provided; fall back to true/false
          const opts = form.allowed_values.length
            ? [...new Set(form.allowed_values.map(asBool))]
            : [true, false];
          return (
            <Stack>
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
            </Stack>
          );
        }
        case 'int': {
          return (
            <Stack>
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
            </Stack>
          );
        }
        case 'decimal': {
          return (
            <Stack>
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
            </Stack>
          );
        }
        case 'json': {
          const items = (form.allowed_values || []).map((v, i) => {
            const s = typeof v === 'string' ? v : stableStringify(v);
            return { key: `${i}-${s}`, value: s, label: s };
          });
          return (
            <Stack>
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
            </Stack>
          );
        }
        case 'text':
        default: {
          return (
            <Stack>
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
            </Stack>
          );
        }
      }
    }

    // No allowed values → fall back to free-form input by data_type
    switch (form.data_type) {
      case 'text':
        return (
          <Stack>
            <InputLabel>Value (text)</InputLabel>
            <TextField
              size="small"
              fullWidth
              value={form.value_text || ''}
              onChange={(e) => handleField('value_text', e.target.value)}
            />
          </Stack>
        );
      case 'int':
        return (
          <Stack>
            <InputLabel>Value (integer)</InputLabel>
            <TextField
              size="small"
              type="number"
              fullWidth
              value={form.value_int || ''}
              onChange={(e) => handleField('value_int', e.target.value)}
            />
          </Stack>
        );
      case 'decimal':
        return (
          <Stack>
            <InputLabel>Value (decimal)</InputLabel>
            <TextField
              size="small"
              type="number"
              fullWidth
              value={form.value_decimal || ''}
              onChange={(e) => handleField('value_decimal', e.target.value)}
            />
          </Stack>
        );
      case 'bool':
        return (
          <Stack>
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
          </Stack>
        );
      case 'json':
        return (
          <Stack>
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
          </Stack>
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
      <Stack alignItems={'center'} spacing={1} direction={'row'}>
        {/* Attribute selector or static code */}
        <Stack sx={{ gap: 1 }} flex={1}>
          <InputLabel>Attribute</InputLabel>
          <Autocomplete
            options={defs}
            value={selectedDef}
            isOptionEqualToValue={(opt, val) => (opt?.code || '') === (val?.code || '')}
            loading={defsLoading}
            onChange={onDefChange}
            getOptionLabel={(o) => (o?.name ? `${o.name}` : o?.code || '')}
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
        </Stack>
        <Stack flex={1}>
          {renderValueInput()}
        </Stack>

        <Stack direction="row" spacing={2} flex={1} >
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

        <Stack direction="row" spacing={1} justifyContent="flex-end" flex={1}>
          <Tooltip title="Close">
            <IconButton
              size="large"
              onClick={() => { console.log('reload original data'); }}
              aria-label="close"
            >
              <CloseCircleFilled />
            </IconButton>
          </Tooltip>

          <Tooltip title={isEdit ? 'Update' : 'Add'}>
            <IconButton
              size="large"
              color="primary"
              onClick={handleSubmit}
              aria-label={isEdit ? 'update' : 'add'}
              disabled={!isEdit && !form.attribute_code}
            >
              {isEdit ? <CheckCircleFilled /> : <PlusCircleFilled />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Remove">
            <IconButton
              size="large"
              color="error"
              onClick={handleRemove}
              aria-label="remove"
              disabled={!isEdit && !form.attribute_code}
            >
              <DeleteFilled size={'20px'} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </>
  );
}
