'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CityTableSection from 'sections/city/CityTableSection';
import CityFormDialog from 'sections/city/CityFormDialog';

import { fetchCitiesRequest, fetchStatesRequest } from 'store/location/locationSlice';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export function CityView() {
  const dispatch = useDispatch();
  const { data, totalPages, currentPage, perPage, totalCount } = useSelector((state) => state.location.cities);
  const { states } = useSelector((state) => state.location);


  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [filters, setFilters] = useState({
    stateId: '',
  });

  useEffect(() => {
    dispatch(fetchCitiesRequest({ page: currentPage, limit: perPage }));
  }, [dispatch, currentPage, perPage]);

  useEffect(() => {
    dispatch(fetchStatesRequest({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelectedCity(null);
  };

  const handleAddButton = () => {
    setSelectedCity(null);
    setOpen(true);
  };

  const handleEditButton = (row) => {
    setSelectedCity(row);
    setOpen(true);
  };

  const handleOnClose = () => {
    setOpen(false);
    setSelectedCity(null);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function'
      ? updater({ pageIndex: currentPage - 1, pageSize: perPage })
      : updater;
    dispatch(fetchCitiesRequest({ page: next.pageIndex + 1, limit: next.pageSize }));
  };

  const applyFilters = (updatedFilters) => {
    setFilters(updatedFilters);
    dispatch(fetchCitiesRequest({ ...updatedFilters, page: 1, limit: perPage }));
  };

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    applyFilters(updated);
  };

  const topActionsLeft = () => (
    <FormControl size='small' sx={{ minWidth: 140 }}>
      <InputLabel sx={{ marginTop: '4px' }}>State</InputLabel>
      <Select
        value={filters.stateId}
        label="State"
        onChange={(e) => handleFilterChange('stateId', e.target.value)}
      >
        <MenuItem value="">All</MenuItem>
        {states.data?.map((item) => (
          <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <>
      <CityTableSection
        data={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={currentPage - 1}
        pageSize={perPage}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        totalCount={totalCount}
        topActionsLeft={topActionsLeft}
      />
      <CityFormDialog open={open} onClose={handleOnClose} initialData={selectedCity} />
    </>
  );
}

export default CityView;