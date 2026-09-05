'use client';

import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { enqueueSnackbar } from 'notistack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { CloseOutlined, CopyOutlined } from '@ant-design/icons';
import { createShareLink, updateShareLink } from 'api/content';
import { getCategory, getProduct, getVariant, listAllVariants, listCategories, listProducts } from 'api/catalog';
import { getStore, listStores } from 'api/sellersStores';
import usePagedAutocomplete from 'hooks/usePagedAutocomplete';
import { RECORD_STATUS } from 'utils/constants';

const TYPES = [
  { value: 'home', label: 'Home / App', needsEntity: false },
  { value: 'screen_guard', label: 'Screen Guard', needsEntity: false },
  { value: 'search', label: 'Search', needsEntity: false, needsQuery: true },
  { value: 'category', label: 'Category', needsEntity: true },
  { value: 'store', label: 'Store', needsEntity: true },
  { value: 'product', label: 'Product', needsEntity: true },
  { value: 'variant', label: 'Product variant', needsEntity: true }
];

function unwrap(res) {
  return res?.data || res || null;
}

function entityLabel(type, entity) {
  if (!entity) return '';
  if (type === 'variant') {
    const name = entity?.product?.name || entity?.name || '';
    const sku = entity?.sku ? ` · ${entity.sku}` : '';
    return `${name}${sku}`.trim() || entity.id;
  }
  return entity.name || entity.slug || entity.id;
}

function listFnForType(type) {
  if (type === 'store') return listStores;
  if (type === 'product') return listProducts;
  if (type === 'variant') return listAllVariants;
  if (type === 'category') return listCategories;
  return null;
}

async function fetchEntity(type, id) {
  if (!type || !id) return null;
  try {
    if (type === 'store') return unwrap(await getStore(id));
    if (type === 'product') return unwrap(await getProduct(id));
    if (type === 'variant') return unwrap(await getVariant(id));
    if (type === 'category') return unwrap(await getCategory(id));
  } catch {
    return null;
  }
  return null;
}

export default function ShareLinksFormDialog({ open, onClose, initialData = null, onSaved }) {
  const isEdit = Boolean(initialData?.id);
  const [type, setType] = useState('home');
  const [label, setLabel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recordStatus, setRecordStatus] = useState(RECORD_STATUS.ACTIVE);
  const [entity, setEntity] = useState(null);
  const [saving, setSaving] = useState(false);
  const [createdUrl, setCreatedUrl] = useState('');

  const typeMeta = TYPES.find((t) => t.value === type);
  const needsEntity = typeMeta?.needsEntity;
  const needsQuery = typeMeta?.needsQuery;
  const listFn = useMemo(() => listFnForType(type), [type]);
  const ac = usePagedAutocomplete(listFn || listCategories);

  useEffect(() => {
    if (!open) return;
    setCreatedUrl('');
    if (initialData) {
      setType(initialData.type || 'home');
      setLabel(initialData.label || '');
      setSearchQuery(initialData.payload?.q || '');
      setRecordStatus(Number(initialData.record_status) || RECORD_STATUS.ACTIVE);
      setEntity(null);
      const payload = initialData.payload || {};
      const id = payload.variant_id || payload.product_id || payload.store_id || payload.category_id;
      if (id && initialData.type) {
        fetchEntity(initialData.type, id).then((row) => setEntity(row));
      }
    } else {
      setType('home');
      setLabel('');
      setSearchQuery('');
      setRecordStatus(RECORD_STATUS.ACTIVE);
      setEntity(null);
    }
  }, [open, initialData]);

  const handleSave = async () => {
    try {
      if (isEdit) {
        setSaving(true);
        await updateShareLink(initialData.id, {
          label: label.trim() || null,
          record_status: recordStatus
        });
        enqueueSnackbar('Share link updated', { variant: 'success' });
        onSaved?.();
        onClose?.();
        return;
      }
      if (needsEntity && !entity?.id) {
        enqueueSnackbar('Pick a destination', { variant: 'warning' });
        return;
      }
      if (needsQuery && searchQuery.trim().length < 2) {
        enqueueSnackbar('Enter a search query', { variant: 'warning' });
        return;
      }
      const body = { type, label: label.trim() || undefined };
      if (type === 'variant') body.variant_id = entity?.id;
      if (type === 'product') body.product_id = entity?.id;
      if (type === 'store') body.store_id = entity?.id;
      if (type === 'category') body.category_id = entity?.id;
      if (type === 'search') body.q = searchQuery.trim();
      setSaving(true);
      const res = await createShareLink(body);
      const data = unwrap(res);
      setCreatedUrl(data?.url || '');
      enqueueSnackbar('Share link created', { variant: 'success' });
      onSaved?.();
    } catch (e) {
      enqueueSnackbar(e?.message || 'Could not save share link', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const options = entity?.id && !(ac.options || []).some((o) => o.id === entity.id)
    ? [entity, ...(ac.options || [])]
    : ac.options || [];

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isEdit ? 'Edit share link' : 'Create share link'}
        <IconButton onClick={onClose} disabled={saving} size="small">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {createdUrl ? (
            <Stack spacing={1}>
              <Typography variant="body2">Copy this URL into WhatsApp, SMS, or a banner deeplink.</Typography>
              <TextField value={createdUrl} fullWidth size="small" InputProps={{ readOnly: true }} />
              <Button
                variant="outlined"
                startIcon={<CopyOutlined />}
                onClick={() => navigator.clipboard?.writeText(createdUrl)}
              >
                Copy URL
              </Button>
            </Stack>
          ) : (
            <>
              <TextField
                select
                size="small"
                label="Destination"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setEntity(null);
                }}
                disabled={saving || isEdit}
                fullWidth
              >
                {TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>

              {needsQuery ? (
                <TextField
                  size="small"
                  label="Search query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="iphone 15 case"
                  disabled={saving || isEdit}
                  fullWidth
                />
              ) : null}

              {needsEntity && listFn ? (
                <Stack spacing={0.5}>
                  <InputLabel>{TYPES.find((t) => t.value === type)?.label}</InputLabel>
                  <Autocomplete
                    options={options}
                    value={entity}
                    loading={ac.loading}
                    disabled={saving || isEdit}
                    getOptionLabel={(o) => entityLabel(type, o)}
                    isOptionEqualToValue={(a, b) => a?.id === b?.id}
                    onChange={(_e, next) => setEntity(next)}
                    onInputChange={(_e, q) => ac.setQuery(q)}
                    ListboxProps={{ onScroll: ac.handleScroll }}
                    renderInput={(params) => <TextField {...params} size="small" placeholder="Search…" />}
                  />
                </Stack>
              ) : null}

              <TextField
                size="small"
                label="Label (optional)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="instagram-week-12"
                disabled={saving}
                fullWidth
              />

              {isEdit ? (
                <TextField
                  select
                  size="small"
                  label="Status"
                  value={recordStatus}
                  onChange={(e) => setRecordStatus(Number(e.target.value))}
                  disabled={saving}
                  fullWidth
                >
                  <MenuItem value={RECORD_STATUS.ACTIVE}>Active</MenuItem>
                  <MenuItem value={RECORD_STATUS.INACTIVE}>Disabled</MenuItem>
                </TextField>
              ) : null}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {createdUrl ? 'Done' : 'Cancel'}
        </Button>
        {!createdUrl ? (
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {isEdit ? 'Save' : 'Create'}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

ShareLinksFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
