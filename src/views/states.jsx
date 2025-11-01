'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// components
import StateTableSection from 'sections/state/StateTableSection';
import StateFormDialog from 'sections/state/StateFormDialog';

// redux
import { fetchStatesRequest } from 'store/location/locationSlice';

export function StateView() {
  const dispatch = useDispatch();
  const { data, totalPages, currentPage, perPage, totalCount } = useSelector((state) => state.location.states);

  const [open, setOpen] = useState(false);
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    dispatch(fetchStatesRequest({ page: currentPage, limit: perPage }));
  }, [dispatch, currentPage, perPage]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelectedState(null);
  };

  const handleOnClose = () => {
    setOpen(false);
    setSelectedState(null);
  };

  const handleAddButton = () => {
    setSelectedState(null);
    setOpen(true);
  };

  const handleEditButton = (row) => {
    setSelectedState(row);
    setOpen(true);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: currentPage - 1, pageSize: perPage }) : updater;
    dispatch(fetchStatesRequest({ page: next.pageIndex + 1, limit: next.pageSize }));
  };

  return (
    <>
      <StateTableSection
        data={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={currentPage - 1}
        pageSize={perPage}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        totalCount={totalCount}
      />
      <StateFormDialog
        open={open}
        onClose={handleOnClose}
        initialData={selectedState}
      />
    </>
  );
}

export default StateView;