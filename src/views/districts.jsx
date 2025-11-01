'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DistrictTableSection from 'sections/district/DistrictTableSection';
import DistrictFormDialog from 'sections/district/DistrictFormDialog';

import { fetchDistrictsRequest, fetchStatesRequest } from 'store/location/locationSlice';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export default function DistrictView() {
  const dispatch = useDispatch();
  const { data, totalPages, currentPage, perPage, totalCount } = useSelector((state) => state.location.districts);
  const { states } = useSelector((state) => state.location);

  const [open, setOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const [filters, setFilters] = useState({
    stateId: '',
  });

  useEffect(() => {
    dispatch(fetchDistrictsRequest({ page: currentPage, limit: perPage }));
  }, [dispatch, currentPage, perPage]);

  useEffect(() => {
    dispatch(fetchStatesRequest({ page: 1, limit: 500 }));
  }, [dispatch]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelectedDistrict(null);
  };

  const handleOnClose = () => {
    setOpen(false);
    setSelectedDistrict(null);
  };

  const handleAddButton = () => {
    setSelectedDistrict(null);
    setOpen(true);
  };

  const handleEditButton = (row) => {
    setSelectedDistrict(row);
    setOpen(true);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: currentPage - 1, pageSize: perPage }) : updater;
    dispatch(fetchDistrictsRequest({ page: next.pageIndex + 1, limit: next.pageSize }));
  };

  const applyFilters = (updatedFilters) => {
    setFilters(updatedFilters);
    dispatch(fetchDistrictsRequest({ ...updatedFilters, page: 1, limit: perPage }));
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
      <DistrictTableSection
        districts={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={currentPage - 1}
        pageSize={perPage}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        totalCount={totalCount}
        topActionsLeft={topActionsLeft}
      />
      <DistrictFormDialog
        open={open}
        onClose={handleOnClose}
        initialData={selectedDistrict}
      />
    </>
  );
}