// src/sections/categories/CategoriesFilters.jsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Autocomplete,
  CircularProgress,
  MenuItem,
  Stack,
  TextField
} from '@mui/material';
import { listCategories } from 'api/catalog';

const RECORD_STATUS_LIST = [
  { value: '', label: 'All' },
  { value: 1, label: 'ACTIVE' },
  { value: 2, label: 'INACTIVE' },
  { value: 3, label: 'ARCHIVED' }
];

const LEVEL_OPTIONS = [
  { value: '', label: 'All levels' },
  { value: 'root', label: 'Root' },
  { value: 'sub', label: 'Sub' }
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'slug', label: 'Slug' },
  { value: 'createdAt', label: 'Created' },
  { value: 'updatedAt', label: 'Updated' }
];

export default function CategoriesFilters({ value, onChange }) {
  // search & list state for the parent category Autocomplete
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const listboxRef = useRef(null);

  const parent = value?.parent || null;
  const record_status = value?.record_status ?? '';
  const q = value?.q ?? '';
  const level = value?.level ?? '';
  const sort = value?.sort ?? 'name';

  const load = useCallback(
    async (p = 1, search = query, append = false) => {
      try {
        setLoading(true);
        const res = await listCategories({ page: p, limit: 20, q: search || undefined });
        const rows = res?.data || [];
        const meta = res?.meta || { page: p, totalPages: 1 };
        setOptions((prev) => (append ? [...prev, ...rows] : rows));
        setPage(meta.page || p);
        setTotalPages(meta.totalPages || 1);
      } catch (_) {
        // ignore – filter helper
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  // initial load
  useEffect(() => {
    load(1, query, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // debounce query changes
  useEffect(() => {
    const t = setTimeout(() => load(1, query, false), 300);
    return () => clearTimeout(t);
  }, [query, load]);

  const handleScroll = (event) => {
    const node = event.currentTarget;
    const nearBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 32;
    if (nearBottom && !loading && page < totalPages) {
      load(page + 1, query, true);
    }
  };

  const setParent = (val) => onChange({ ...value, parent: val });
  const setRecordStatus = (val) => onChange({ ...value, record_status: val });
  const setQ = (val) => onChange({ ...value, q: val });
  const setLevel = (val) => onChange({ ...value, level: val });
  const setSort = (val) =>
    onChange({
      ...value,
      sort: val,
      dir: val === 'name' || val === 'slug' ? 'ASC' : 'DESC'
    });

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1}
      useFlexGap
      flexWrap="wrap"
      alignItems={{ md: 'center' }}
    >
      <TextField
        size="small"
        variant="outlined"
        label="Search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Name or slug…"
        sx={{ minWidth: 200 }}
      />

      {/* Parent category (server-paginated autocomplete) */}
      <Stack minWidth={{ xs: '100%', md: 220 }} sx={{ gap: 1 }}>
        <Autocomplete
          options={options}
          value={parent}
          loading={loading}
          onChange={(_, v) => setParent(v)}
          onOpen={() => load(1, query, false)}
          getOptionLabel={(opt) => (opt?.name ? String(opt.name) : '')}
          isOptionEqualToValue={(a, b) => a?.id === b?.id}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              variant="outlined"
              label="Parent Category"
              placeholder="Search category…"
              onChange={(e) => setQuery(e.target.value)}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
          ListboxProps={{
            onScroll: handleScroll,
            ref: listboxRef,
            style: { maxHeight: 320, overflow: 'auto' }
          }}
        />
      </Stack>

      <Stack sx={{ gap: 1, minWidth: 130 }}>
        <TextField
          select
          size="small"
          variant="outlined"
          label="Record Status"
          value={record_status}
          onChange={(e) => setRecordStatus(e.target.value)}
        >
          {RECORD_STATUS_LIST.map((r) => (
            <MenuItem key={String(r.value)} value={r.value}>
              {r.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <TextField
        select
        size="small"
        label="Level"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        sx={{ minWidth: 110 }}
      >
        {LEVEL_OPTIONS.map((option) => (
          <MenuItem key={option.value || 'all'} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Sort"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        sx={{ minWidth: 115 }}
      >
        {SORT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}

CategoriesFilters.propTypes = {
  value: PropTypes.shape({
    parent: PropTypes.object,
    record_status: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    q: PropTypes.string,
    level: PropTypes.string,
    sort: PropTypes.string,
    dir: PropTypes.string
  }),
  onChange: PropTypes.func.isRequired
};