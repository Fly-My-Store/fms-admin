'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

import {
  fetchStatesRequest,
  fetchDistrictsRequest,
  fetchZonesRequest,
  fetchCitiesRequest
} from 'store/location/locationSlice';

/* ---------- CONFIG PER ACCESS TYPE ---------- */
const selectorMap = {
  state: {
    label: 'State',
    data: (s) => s.location.states,
    total: (s) => s.location.statesTotal,
    loading: (s) => s.location.loadingStates,
    action: fetchStatesRequest
  },
  district: {
    label: 'District',
    data: (s) => s.location.districts,
    total: (s) => s.location.districtsTotal,
    loading: (s) => s.location.loadingDistricts,
    action: fetchDistrictsRequest
  },
  zone: {
    label: 'Zone',
    data: (s) => s.location.zones,
    total: (s) => s.location.zonesTotal,
    loading: (s) => s.location.loadingZones,
    action: fetchZonesRequest
  },
  city: {
    label: 'City',
    data: (s) => s.location.cities.data,
    total: (s) => s.location.citiesTotal,
    loading: (s) => s.location.loadingCities,
    action: fetchCitiesRequest
  }
};

/* ---------- COMPONENT ---------- */
const AccessValueSelector = ({ type, selectedIds = [], onChange }) => {
  const cfg = selectorMap[type];
  const dispatch = useDispatch();

  /* redux-derived props */
  const pageData = useSelector(cfg.data);
  const totalCount = useSelector(cfg.total);
  const loading = useSelector(cfg.loading);

  /* local state */
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const limit = 20;

  /* ------------ FETCH --------------- */
  useEffect(() => {
    dispatch(cfg.action({ page, limit, search: inputValue }));
  }, [dispatch, cfg.action, page, inputValue]);

  /* ------------ MERGE PAGE RESULTS --------------- */
  useEffect(() => {
    if (!pageData) return;
    setOptions((prev) =>
      page === 1 ? pageData : [...prev, ...pageData.filter((d) => !prev.find((p) => p.id === d.id))]
    );
  }, [pageData, page]);

  /* ------------ INITIAL / EDIT PRELOAD --------------- */
  useEffect(() => {
    if (selectedIds.length && options.length) {
      const sel = options.filter((o) => selectedIds.includes(o.id));
      // ensure even missing items are visible
      const missing = selectedIds
        .filter((id) => !sel.find((s) => s.id === id))
        .map((id) => ({ id, name: id })); // fallback label
      setSelected([...sel, ...missing]);
    }
  }, [selectedIds, options]);

  /* ------------ EVENTS --------------- */
  const handleInputChange = (_e, value) => {
    setInputValue(value);
    setPage(1);
    setOptions([]);                 // reset list on new search
  };

  const handleChange = (_e, values) => {
    setSelected(values);
    onChange(values.map((v) => v.id));
  };

  const handleScroll = (evt) => {
    const node = evt.currentTarget;
    if (
      node.scrollTop + node.clientHeight >= node.scrollHeight - 1 &&
      options.length < totalCount &&
      !loading
    ) {
      setPage((p) => p + 1);        // load next page
    }
  };

  /* ------------ RENDER --------------- */
  return (
    <Autocomplete
      multiple
      options={options}
      value={selected}
      getOptionLabel={(opt) => opt.name ?? opt.id}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      ListboxProps={{ onScroll: handleScroll }}
      filterSelectedOptions
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={`Select ${cfg.label}s`}
          placeholder={`Search ${cfg.label}`}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={18} />}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
    />
  );
};

AccessValueSelector.propTypes = {
  type: PropTypes.oneOf(['state', 'district', 'zone', 'city']).isRequired,
  selectedIds: PropTypes.array,
  onChange: PropTypes.func.isRequired
};

export default AccessValueSelector;