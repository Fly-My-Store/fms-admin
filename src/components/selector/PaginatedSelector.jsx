// PaginatedSelector.js
// Reusable MUI selector that supports single & multiple mode, paginated remote data, and keeps pre-selected values even if they are not in the current page.

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { InputLabel, Stack } from '@mui/material';


export default function PaginatedSelector({
  multiple = false,
  label,
  value,
  onChange,
  fetchOptions,
  initialSelected = [],
  pageSize = 20,
  textFieldProps = {},
}) {
  const [inputValue, setInputValue] = useState('');
  const [page, setPage] = useState(1);
  const [options, setOptions] = useState(initialSelected);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const safeOptions = Array.isArray(options) ? options : [];

  const normalizedInitialSelected = useMemo(() => {
    if (Array.isArray(initialSelected)) return initialSelected;
    if (initialSelected && typeof initialSelected === 'object') return [initialSelected];
    return [];
  }, [initialSelected]);

  const mergeOptions = useCallback((incoming) => {
    setOptions((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const map = new Map();
      [...safePrev, ...incoming, ...normalizedInitialSelected].forEach((opt) => {
        map.set(opt.id, opt);
      });
      return [...map.values()];
    });
  }, [normalizedInitialSelected]);

  const load = useCallback(async (q = inputValue, p = page) => {
    setLoading(true);
    try {
      const { items, totalPages: tp } = await fetchOptions(q, p);
      mergeOptions(items);
      setTotalPages(tp);
    } finally {
      setLoading(false);
    }
  }, [fetchOptions, inputValue, page, mergeOptions]);

  // fetch on page or query change
  useEffect(() => {
    load();
  }, [page, inputValue]);

  // listbox infinite scroll handler
  const listboxRef = useRef();
  const handleListboxRef = (node) => {
    if (!node) return;
    listboxRef.current = node;
    node.addEventListener('scroll', () => {
      if (
        node.scrollTop + node.clientHeight >= node.scrollHeight - 20 &&
        !loading &&
        page < totalPages
      ) {
        setPage((prev) => prev + 1);
      }
    });
  };



  // dedupe options each render (useful if initialSelected changes later)
  const visibleOptions = useMemo(() => {
    const safeOptions = Array.isArray(options) ? options : [];
    const map = new Map();
    [...safeOptions, ...normalizedInitialSelected].forEach((o) => map.set(o.id, o));
    return [...map.values()];
  }, [options, normalizedInitialSelected]);

  return (
    <Autocomplete
      multiple={multiple}
      options={visibleOptions}
      getOptionLabel={(o) => o.name}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newInput) => {
        setInputValue(newInput);
        setPage(1);
        setOptions(initialSelected); // reset when query changes
      }}
      ListboxProps={{
        ref: handleListboxRef,
        style: { maxHeight: 300, overflow: 'auto' },
      }}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      renderInput={(params) => (
        <TextField
          {...params}
          {...textFieldProps}
          placeholder={
            !multiple && (!value || (typeof value === 'object' && !value.name))
              ? `${label}`
              : ''
          }
          sx={{
            '& .MuiInputBase-input::placeholder': {
              color: 'grey.700', // or any color like '#999' or 'primary.light'
              opacity: 1, // ensure it's fully visible
            },
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

PaginatedSelector.propTypes = {
  multiple: PropTypes.bool,
  label: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  fetchOptions: PropTypes.func.isRequired,
  initialSelected: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.any.isRequired, name: PropTypes.string.isRequired })
  ),
  pageSize: PropTypes.number,
  textFieldProps: PropTypes.object,
};
