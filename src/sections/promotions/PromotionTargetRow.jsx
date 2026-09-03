'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  TextField
} from '@mui/material';
import { DeleteOutlined } from '@ant-design/icons';
import {
  getBrand,
  getCategory,
  getProduct,
  getVariant,
  listAllVariants,
  listBrands,
  listCategories,
  listProducts
} from 'api/catalog';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';

const TARGET_TYPES = [
  { value: 'BRAND', label: 'Brand' },
  { value: 'CATEGORY', label: 'Category' },
  { value: 'PRODUCT', label: 'Product' },
  { value: 'PRODUCT_VARIANT', label: 'Product variant' }
];

function withSelectedOption(options, selected) {
  if (!selected?.id) return options;
  if (options.some((o) => o?.id === selected.id)) return options;
  return [selected, ...options];
}

function unwrapEntity(res) {
  return res?.data || res || null;
}

export function targetEntityLabel(targetType, entity) {
  if (!entity) return '';
  if (targetType === 'PRODUCT_VARIANT') {
    const name = entity?.product?.name || entity?.name || '';
    const sku = entity?.sku ? ` · ${entity.sku}` : '';
    return `${name}${sku}`.trim() || entity.id;
  }
  return entity.name || entity.slug || entity.id;
}

async function fetchTargetEntity(targetType, targetId) {
  if (!targetType || !targetId) return null;
  try {
    if (targetType === 'BRAND') return unwrapEntity(await getBrand(targetId));
    if (targetType === 'CATEGORY') return unwrapEntity(await getCategory(targetId));
    if (targetType === 'PRODUCT') return unwrapEntity(await getProduct(targetId));
    if (targetType === 'PRODUCT_VARIANT') return unwrapEntity(await getVariant(targetId));
  } catch {
    return null;
  }
  return null;
}

function listFnForType(targetType) {
  if (targetType === 'BRAND') return listBrands;
  if (targetType === 'PRODUCT') return listProducts;
  if (targetType === 'PRODUCT_VARIANT') return listAllVariants;
  return listCategories;
}

/**
 * One promotion target row: type select + paged Autocomplete (same pattern as catalog filters).
 */
export default function PromotionTargetRow({ value, onChange, onRemove, disabled }) {
  const targetType = value?.target_type || 'CATEGORY';
  const listFn = useMemo(() => listFnForType(targetType), [targetType]);
  const ac = usePagedAutocomplete(listFn);
  const [selected, setSelected] = useState(value?.entity || null);
  const [hydrating, setHydrating] = useState(false);

  useEffect(() => {
    if (value?.entity?.id) {
      setSelected(value.entity);
      return;
    }
    if (!value?.target_id) {
      setSelected(null);
      return;
    }
    let cancelled = false;
    setHydrating(true);
    (async () => {
      const entity = await fetchTargetEntity(targetType, value.target_id);
      if (cancelled) return;
      setSelected(entity);
      setHydrating(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [targetType, value?.target_id, value?.entity]);

  const handleTypeChange = (nextType) => {
    setSelected(null);
    ac.setQuery('');
    onChange({
      target_type: nextType,
      target_id: '',
      entity: null,
      label: ''
    });
  };

  const handleSelect = (_, entity) => {
    setSelected(entity);
    onChange({
      target_type: targetType,
      target_id: entity?.id || '',
      entity: entity || null,
      label: targetEntityLabel(targetType, entity)
    });
  };

  const placeholder =
    targetType === 'PRODUCT_VARIANT'
      ? 'Search variants…'
      : targetType === 'PRODUCT'
        ? 'Search products…'
        : targetType === 'BRAND'
          ? 'Search brands…'
          : 'Search categories…';

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'flex-start' }}>
      <TextField
        select
        size="small"
        label="Type"
        value={targetType}
        onChange={(e) => handleTypeChange(e.target.value)}
        sx={{ width: { xs: '100%', sm: 180 }, flexShrink: 0 }}
        disabled={disabled}
      >
        {TARGET_TYPES.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <Autocomplete
        sx={{ flex: 1, minWidth: 0 }}
        size="small"
        options={withSelectedOption(ac.options, selected)}
        value={selected}
        loading={ac.loading || hydrating}
        getOptionLabel={(o) => targetEntityLabel(targetType, o)}
        isOptionEqualToValue={(a, b) => a?.id === b?.id}
        onChange={handleSelect}
        onInputChange={(_, v, reason) => {
          if (reason === 'reset') return;
          ac.setQuery(v);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Target"
            placeholder={placeholder}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {ac.loading || hydrating ? <CircularProgress color="inherit" size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
        ListboxProps={{ onScroll: ac.handleScroll, style: { maxHeight: 280, overflow: 'auto' } }}
        disabled={disabled}
      />

      <IconButton color="error" onClick={onRemove} disabled={disabled} aria-label="Remove target" sx={{ mt: { sm: 0.5 } }}>
        <DeleteOutlined />
      </IconButton>
    </Stack>
  );
}
