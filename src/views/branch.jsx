'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// MUI
import { Stack, MenuItem, FormControl, InputLabel, Select, Button } from '@mui/material';

// sections & components
import BranchTableSection from 'sections/branch/BranchTableSection';
import BranchFormDialog from 'sections/branch/BranchFormDialog';

import {fetchBranchesRequest} from 'store/location/locationSlice';
import BranchSummary from 'sections/branch/BranchSummary';
import { DebouncedInput } from 'components/third-party/react-table';
import MainCard from 'components/MainCard';
import BranchFilters from 'sections/branch/BranchFilters';

export function BranchView() {
  const dispatch = useDispatch();
  const { branches } = useSelector((state) => state.location);
  const { data, totalPages, currentPage, perPage } = branches;

  const [filters, setFilters] = useState({
    search: '',
    stateId: '',
    districtId: '',
    cityId: '',
    zoneId: ''
  });

  const [open, setOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    dispatch(fetchBranchesRequest({ page: currentPage, limit: perPage }));
  }, [dispatch]);


  const applyFilters = (updatedFilters) => {
    setFilters(updatedFilters);
    dispatch(fetchBranchesRequest({ ...updatedFilters, page: 1, limit: perPage }));
  };

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    applyFilters(updated);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function'
      ? updater({ pageIndex: currentPage - 1, pageSize: perPage })
      : updater;
    dispatch(fetchBranchesRequest({ ...filters, page: next.pageIndex + 1, limit: next.pageSize }));
  };

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelectedBranch(null);
  };

  const handleOnClose = () => {
    setOpen(false);
    setSelectedBranch(null);
  };

  const handleAddButton = () => {
    setSelectedBranch(null);
    setOpen(true);
  };

  const handleEditButton = (row) => {
    setSelectedBranch(row);
    setOpen(true);
  };


  return (
    <>
      <MainCard sx={{ mb: 2 }} title="Branches" >
        <BranchFilters handleAddButton={handleAddButton} handleFilterChange={handleFilterChange} filters={filters} />
        <BranchSummary filters={filters} />
      </MainCard>
      <BranchTableSection
        branches={data}
        handleEditButton={handleEditButton}
        pageIndex={currentPage - 1}
        pageSize={perPage}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <BranchFormDialog
        open={open}
        onClose={handleOnClose}
        initialData={selectedBranch}
      />
    </>
  );
}

export default BranchView;