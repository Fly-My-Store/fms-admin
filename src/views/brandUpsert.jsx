'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as catalog } from 'store/catalog/slice';
import { useParams, useRouter } from 'next/navigation';
import { createBrand, updateBrand, uploadBrandLogo } from 'api/catalog';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';

// MUI
import {
  Avatar,
  Button,
  Divider,
  InputLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
  FormHelperText
} from '@mui/material';

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
  status: 'DRAFT',
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

  // fetch existing
  useEffect(() => {
    if (!id) return;
    dispatch(catalog.brandsGetRequest({ params: { id } }));
  }, [dispatch, id]);

  // hydrate form when loaded
  useEffect(() => {
    if (row) {
      setForm({
        id: row.id,
        name: row.name || '',
        slug: row.slug || '',
        description: row.description || '',
        logo_url: row.logo_url || '',
        status: row.status || 'SUBMITTED',
        record_status: 1,
        sort_letter: row.sort_letter || toSortLetter(row.name)
      });
      setLogoPreview(row.logo_url || '');
      setLogoFile(null);
    } else if (!id) {
      setForm(EMPTY);
      setLogoFile(null);
      setLogoPreview('');
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
      slug: p.slug ? p.slug : slugify(value),
      sort_letter: p.sort_letter ? p.sort_letter : toSortLetter(value)
    }));
  };

  // --- Logo upload handlers ---
  const handleLogoSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    const url = URL.createObjectURL(f);
    setLogoPreview(url);
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview('');
  };

  const handleSubmit = async () => {
    try {
      // upload logo first if a new file is chosen
      let logoUrl = form.logo_url || null;
      if (logoFile) {
        try {
          setUploadingLogo(true);
          const res = await uploadBrandLogo(logoFile); // must exist in api/catalog
          logoUrl = res?.url || res?.data?.url || logoUrl;
        } catch (e) {
          enqueueSnackbar('Logo upload failed, using existing URL field.', { variant: 'warning' });
        } finally {
          setUploadingLogo(false);
        }
      }

      const payload = {
        name: form.name?.trim(),
        slug: form.slug?.trim() || slugify(form.name),
        description: form.description || '',
        logo_url: logoUrl,
        sort_letter: (form.sort_letter || toSortLetter(form.name) || '').toUpperCase(),
        status: form.status,
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
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="e.g., Samsung"
                />
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel>Slug</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  value={form.slug}
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
                  value={form.description}
                  onChange={(e) => handleField('description', e.target.value)}
                  placeholder="Short description"
                />
              </Stack>

              {/* Logo upload */}
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Logo</InputLabel>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    variant="rounded"
                    src={logoPreview || form.logo_url || undefined}
                    sx={{ width: 48, height: 48, borderRadius: 1 }}
                  >
                    {form.name?.[0]?.toUpperCase() || 'B'}
                  </Avatar>
                  <Button component="label" variant="outlined" size="small" disabled={uploadingLogo}>
                    {uploadingLogo ? 'Uploading…' : 'Upload'}
                    <input type="file" accept="image/*" hidden onChange={handleLogoSelect} />
                  </Button>
                  {logoPreview || form.logo_url ? (
                    <Button size="small" onClick={handleLogoRemove}>Remove</Button>
                  ) : null}
                </Stack>
                <FormHelperText>
                  Upload a logo image. If a file is chosen, it will be uploaded and used as the logo URL.
                </FormHelperText>
              </Stack>

              {/* Optional manual URL */}
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Logo URL (optional)</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  value={form.logo_url}
                  onChange={(e) => handleField('logo_url', e.target.value)}
                  placeholder="https://..."
                />
                <FormHelperText>If you don’t upload a file, this URL will be used.</FormHelperText>
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
                <InputLabel>Status</InputLabel>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={form.status}
                  onChange={(e) => handleField('status', e.target.value)}
                >
                  {STATUS_LIST.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
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
