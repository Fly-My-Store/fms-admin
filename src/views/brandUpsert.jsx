'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as catalog } from 'store/catalog/slice';
import { useParams, useRouter } from 'next/navigation';
import { createBrand, updateBrand } from 'api/catalog';
import { uploadSingle } from 'api/upload';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';

// MUI
import {
  Avatar,
  Box,
  Button,
  Divider,
  InputLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
  FormHelperText
} from '@mui/material';
import Image from 'next/image';

// If your Brand has a workflow status keep this list; otherwise you can hide the field in UI
const STATUS_LIST = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'];
const RECORD_STATUS_LIST = [
  { value: 1, label: 'ACTIVE' },
  { value: 2, label: 'INACTIVE' },
  { value: 3, label: 'ARCHIVED' }
];

const EMPTY = {
  id: '',
  name: '',
  slug: '',
  description: '',
  logo_url: '',
  sort_letter: '',
  record_status: 1
};

function slugify(s = '') {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function toSortLetter(s = '') {
  const c = String(s).trim().charAt(0);
  if (!c) return '';
  const upper = c.toUpperCase();
  // keep A-Z or 0-9, otherwise '#'
  return /[A-Z0-9]/.test(upper) ? upper : '#';
}

export function BrandUpsert() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();

  const { brandsDetail } = useSelector((s) => s.catalog || {});
  const detail = brandsDetail || { data: null, loading: false, error: null };
  const row = detail.data;
  const error = detail.error;
  const loading = detail.loading;

  const [form, setForm] = useState(EMPTY);

  // logo upload local state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Reset form when id is cleared (navigating to create)
  useEffect(() => {
    if (!id) {
      setForm(EMPTY);
      setLogoFile(null);
      setLogoPreview('');
    }
  }, [id]);

  // fetch existing
  useEffect(() => {
    if (!id) return;
    dispatch(catalog.brandsGetRequest({ params: { id } }));
  }, [dispatch, id]);

  // hydrate form when loaded
  useEffect(() => {
    if (row && id) {
      setForm({
        id: row.id,
        name: row.name || '',
        slug: row.slug || '',
        description: row.description || '',
        logo_url: row.logo_url || '',
        record_status: row.record_status ?? 1,
        sort_letter: row.sort_letter || toSortLetter(row.name)
      });
      setLogoPreview(row.logo_url || '');
      setLogoFile(null);
    }
  }, [row, id]);

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: 'error' });
  }, [error]);

  const handleField = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setForm((p) => ({
      ...p,
      name: value,
      slug: slugify(value),
      sort_letter: p.sort_letter ? p.sort_letter : toSortLetter(value)
    }));
  };

  // --- Logo upload handlers ---
  const handleLogoSelect = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Clear the input so selecting the same file again triggers onChange
    e.target.value = '';
    try {
      setUploadingLogo(true);
      setUploadProgress(0);
      // Upload immediately using common upload API
      const res = await uploadSingle(f, (pe) => {
        if (pe && pe.total) {
          const pct = Math.round((pe.loaded * 100) / pe.total);
          setUploadProgress(pct);
        }
      });
      const url = res?.url || res?.data?.url;
      if (!url) throw new Error('Upload failed: no URL returned');
      // Persist into form and preview
      setForm((p) => ({ ...p, logo_url: url }));
      setLogoPreview(url);
      setLogoFile(null);
      enqueueSnackbar('Logo uploaded', { variant: 'success' });
    } catch (err) {
      setLogoFile(null);
      setLogoPreview('');
      const msg = err?.response?.data?.message || err?.message || 'Logo upload failed';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setUploadingLogo(false);
      setUploadProgress(0);
    }
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview('');
    setForm((p) => ({ ...p, logo_url: '' }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: form.name?.trim(),
        slug: form.slug?.trim() || slugify(form.name),
        description: form.description || '',
        logo_url: form.logo_url || '',
        sort_letter: (form.sort_letter || toSortLetter(form.name) || '').toUpperCase(),
        record_status: Number(form.record_status ?? 1)
      };

      if (id || form.id) {
        const bid = id || form.id;
        await updateBrand(bid, payload);
        enqueueSnackbar('Brand updated', { variant: 'success' });
      } else {
        await createBrand(payload);
        enqueueSnackbar('Brand created', { variant: 'success' });
      }
      router.push('/brands');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Something went wrong.';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const breadcrumb = useMemo(() => {
    const name = form?.name || id || 'new-brand';
    return {
      heading: id ? 'edit-brand' : 'create-brand',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'brands', to: '/brands' },
        { title: name, i18n: false }
      ]
    };
  }, [form?.name, id]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard border={false} boxShadow>
        <Stack spacing={3}>

          {/* Two-column form */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {/* Left column */}
            <Stack flex={1} spacing={2}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Name</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  value={form.name || ''}
                  onChange={handleNameChange}
                  placeholder="e.g., Samsung"
                />
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel>Slug</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  value={form.slug || ''}
                  onChange={(e) => handleField('slug', e.target.value)}
                  placeholder="samsung"
                />
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel>Description</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  minRows={3}
                  value={form.description || ''}
                  onChange={(e) => handleField('description', e.target.value)}
                  placeholder="Short description"
                />
              </Stack>

              {/* Logo upload */}
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Logo</InputLabel>
                <Stack direction="row" spacing={2} alignItems="center">
                  {(logoPreview || form.logo_url) ? (
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 1,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <img
                        src={logoPreview || form.logo_url}
                        alt={form.name || 'Brand logo'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                    </Box>
                  ) : (
                    <Avatar
                      variant="rounded"
                      sx={{ width: 100, height: 100, borderRadius: 1 }}
                    >
                      {form.name?.[0]?.toUpperCase() || 'B'}
                    </Avatar>
                  )}
                  <Button component="label" variant="outlined" size="small" disabled={uploadingLogo}>
                    {uploadingLogo ? `Uploading… ${uploadProgress || 0}%` : 'Upload'}
                    <input type="file" accept="image/*" hidden onChange={handleLogoSelect} />
                  </Button>
                  {logoPreview || form.logo_url ? (
                    <Button size="small" onClick={handleLogoRemove}>Remove</Button>
                  ) : null}
                </Stack>
                <FormHelperText>
                  Choose an image to upload immediately; the returned URL is saved to the form.
                </FormHelperText>
              </Stack>
            </Stack>

            {/* Right column */}
            <Stack flex={1} spacing={2}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Sort Letter</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  value={form.sort_letter}
                  onChange={(e) => handleField('sort_letter', toSortLetter(e.target.value))}
                  placeholder="S"
                />
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
                  {RECORD_STATUS_LIST.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>
          </Stack>

          <Divider />

          {/* Actions */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={() => router.push('/brands')}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading || !form.name || uploadingLogo}>
              {id ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </MainCard>
    </>
  );
}

export default BrandUpsert;
