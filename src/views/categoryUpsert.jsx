'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as catalog } from 'store/catalog/slice';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { createCategory, updateCategory, uploadCategoryIcon, listCategories } from 'api/catalog';
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
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

const STATUS_LIST = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'DISABLED'];
const RECORD_STATUS_LIST = [
  { value: 1, label: 'ACTIVE' },
  { value: 2, label: 'INACTIVE' },
  { value: 3, label: 'ARCHIVED' }
];
const LEVEL_OPTIONS = [
  { value: 0, label: 'Root' },
  { value: 1, label: 'Sub' }
];

const EMPTY = {
  id: '',
  parent_id: '',
  name: '',
  slug: '',
  description: '',
  icon_url: '',
  level: 0,
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

export function CategoryUpsert() {
  const { id } = useParams();
  const search = useSearchParams();
  const dispatch = useDispatch();
  const router = useRouter();

  const { categoryDetail } = useSelector((s) => s.catalog || {});
  const detail = categoryDetail || { data: null, loading: false, error: null };
  const cat = detail.data;
  const error = detail.error;
  const loading = detail.loading;

  const [form, setForm] = useState(EMPTY);

  // parent meta shown read-only in UI
  const [parentMeta, setParentMeta] = useState(null); // { id, name }

  // icon upload local state
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('');
  const [uploadingIcon, setUploadingIcon] = useState(false);

  // parent autocomplete state
  const [parentQuery, setParentQuery] = useState('');
  const [parentOptions, setParentOptions] = useState([]); // [{id,name}]
  const [parentPage, setParentPage] = useState(1);
  const [parentHasMore, setParentHasMore] = useState(false);
  const [parentLoading, setParentLoading] = useState(false);
  // remote fetch for parent autocomplete (paginated)
  useEffect(() => {
    let cancelled = false;
    async function run() {
      setParentLoading(true);
      try {
        const limit = 20;
        const payload = await listCategories({ q: parentQuery, page: parentPage, limit });
        const items = payload?.data || payload?.rows || [];
        const pageVal = payload?.page || parentPage;
        const totalPages = payload?.totalPages || (payload?.count ? Math.ceil(payload.count / limit) : 1);
        if (!cancelled) {
          setParentOptions((prev) => (parentPage === 1 ? items : [...prev, ...items]));
          setParentHasMore(pageVal < totalPages);
        }
      } catch (_) {
        if (!cancelled) {
          setParentOptions((prev) => (parentPage === 1 ? [] : prev));
          setParentHasMore(false);
        }
      } finally {
        if (!cancelled) setParentLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [parentQuery, parentPage, parentMeta?.id]);

  // fetch existing
  useEffect(() => {
    if (!id) return;
    dispatch(catalog.categoriesGetRequest({ params: { id } }));
  }, [dispatch, id]);

  // hydrate form when loaded (edit mode)
  useEffect(() => {
    if (cat) {
      setForm({
        id: cat.id || '',
        parent_id: cat.parent_id || '',
        name: cat.name || '',
        slug: cat.slug || '',
        description: cat.description || '',
        icon_url: cat.icon_url || '',
        status: cat.status || 'SUBMITTED',
        record_status: cat.record_status || 1,
        level: Number(cat.level ?? 0)
      });
      // parent meta (best-effort; parent name may not be present in this endpoint)
      setParentMeta(cat.parent_id ? { id: cat.parent_id, name: cat.parent?.name || '' } : null);
      setIconPreview(cat.icon_url || '');
      setIconFile(null);
    }
  }, [cat]);

  // create mode: read parent from query params once on mount
  useEffect(() => {
    if (id) return; // only for create
    const pid = search?.get('parent_id');
    const pname = search?.get('parent_name');
    if (pid) {
      setForm((p) => ({ ...p, parent_id: pid }));
      setParentMeta({ id: pid, name: pname ? decodeURIComponent(pname) : '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      slug: slugify(value)
    }));
  };

  // --- Icon upload handlers ---
  const handleIconSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setIconFile(f);
    const url = URL.createObjectURL(f);
    setIconPreview(url);
  };

  const handleIconRemove = () => {
    setIconFile(null);
    setIconPreview('');
  };


  const handleSubmit = async () => {
    try {
      // upload icon first if a new file is chosen
      let iconUrl = form.icon_url || null;
      if (iconFile) {
        try {
          setUploadingIcon(true);
          const res = await uploadCategoryIcon(iconFile);
          iconUrl = res?.url || res?.data?.url || iconUrl;
        } catch (e) {
          enqueueSnackbar('Icon upload failed, using existing URL field.', { variant: 'warning' });
        } finally {
          setUploadingIcon(false);
        }
      }

      const payload = {
        parent_id: form.parent_id || null, // include parent if present (create subcategory)
        name: form.name?.trim(),
        slug: form.slug?.trim() || slugify(form.name),
        description: form.description || null,
        icon_url: iconUrl,
        level: Number(form.level ?? 0),
        status: form.status,
        record_status: Number(form.record_status ?? 1)
      };

      if (id || form.id) {
        const cid = id || form.id;
        await updateCategory(cid, payload);
        enqueueSnackbar('Category updated', { variant: 'success' });
      } else {
        await createCategory(payload);
        enqueueSnackbar('Category created', { variant: 'success' });
      }
      router.push('/categories');
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
    const name = form?.name || id || 'new-category';
    return {
      heading: id ? 'edit-category' : 'create-category',
      links: [
        { title: 'home', to: '/dashboard' },
        { title: 'categories', to: '/categories' },
        { title: name, i18n: false }
      ]
    };
  }, [form?.name, id]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumb.heading} links={breadcrumb.links} />
      <MainCard border={false} boxShadow>
        <Stack spacing={2}>
          <Stack sx={{ maxWidth: 520, gap: 1 }}>
            <InputLabel>Parent Category (optional)</InputLabel>
            <Autocomplete
              size="small"
              options={parentOptions}
              value={parentMeta ? { id: parentMeta.id, name: parentMeta.name } : null}
              getOptionLabel={(o) => o?.name || ''}
              loading={parentLoading}
              isOptionEqualToValue={(a, b) => a?.id === b?.id}
              onOpen={() => {
                if (parentOptions.length === 0) {
                  setParentPage(1);
                }
              }}
              onInputChange={(_, value) => {
                setParentQuery(value || '');
                setParentPage(1);
                setParentOptions([]);
              }}
              onChange={(_, val) => {
                if (val && val.id) {
                  setParentMeta({ id: val.id, name: val.name });
                  setForm((p) => ({ ...p, parent_id: val.id }));
                } else {
                  // cleared
                  setParentMeta(null);
                  setForm((p) => ({ ...p, parent_id: '' }));
                  setParentQuery('');
                  setParentPage(1);
                  setParentOptions([]);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search categories…"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {parentLoading ? <CircularProgress color="inherit" size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              ListboxProps={{
                onScroll: (event) => {
                  const list = event.currentTarget;
                  if (
                    list.scrollTop + list.clientHeight >= list.scrollHeight - 1 &&
                    parentHasMore &&
                    !parentLoading
                  ) {
                    setParentPage((p) => p + 1);
                  }
                }
              }}
            />
            <FormHelperText>Choose a parent to create a subcategory (optional).</FormHelperText>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Stack flex={1} spacing={2}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Name</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  value={form.name}
                  onChange={handleNameChange}
                  placeholder="e.g., Smartphones"
                />
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel>Slug</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  value={form.slug}
                  onChange={(e) => handleField('slug', e.target.value)}
                  placeholder="smartphones"
                />
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel>Description</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  multiline
                  minRows={6}
                  value={form.description}
                  onChange={(e) => handleField('description', e.target.value)}
                  placeholder="Short description"
                />
              </Stack>

              {/* Icon upload */}
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Icon</InputLabel>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    variant="rounded"
                    src={iconPreview || form.icon_url || undefined}
                    sx={{ width: 48, height: 48, borderRadius: 1 }}
                  >
                    {form.name?.[0]?.toUpperCase() || 'C'}
                  </Avatar>
                  <Button component="label" variant="outlined" size="small" disabled={uploadingIcon}>
                    {uploadingIcon ? 'Uploading…' : 'Upload'}
                    <input type="file" accept="image/*" hidden onChange={handleIconSelect} />
                  </Button>
                  {iconPreview || form.icon_url ? (
                    <Button size="small" onClick={handleIconRemove}>Remove</Button>
                  ) : null}
                </Stack>
                <FormHelperText>
                  Upload an icon image. If a file is chosen, it will be uploaded and used as the icon URL.
                </FormHelperText>
              </Stack>

              {/* Optional manual URL entry */}
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Icon URL (optional)</InputLabel>
                <TextField
                  size="small"
                  fullWidth
                  value={form.icon_url}
                  onChange={(e) => handleField('icon_url', e.target.value)}
                  placeholder="https://..."
                />
                <FormHelperText>If you don’t upload a file, this URL will be used.</FormHelperText>
              </Stack>
            </Stack>

            <Stack flex={1} spacing={2}>
              {/* Parent shown above as a highlighted panel */}

              {/* Level select */}
              <Stack sx={{ gap: 1 }}>
                <InputLabel>Level</InputLabel>
                <TextField
                  size="small"
                  select
                  fullWidth
                  value={Number(form.level ?? 0)}
                  onChange={(e) => handleField('level', Number(e.target.value))}
                >
                  {LEVEL_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
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
            <Button onClick={() => router.push('/categories')}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading || !form.name || uploadingIcon}>
              {id ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Stack>
      </MainCard>
    </>
  );
}

export default CategoryUpsert;
