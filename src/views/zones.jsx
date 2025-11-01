'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ZoneTableSection from 'sections/zone/ZoneTableSection';
import ZoneFormDialog from 'sections/zone/ZoneFormDialog';

import { fetchZonesRequest } from 'store/location/locationSlice';

export default function ZoneView() {
  const dispatch = useDispatch();
  const { data, totalPages, currentPage, perPage, totalCount } = useSelector((state) => state.location.zones);
  const [open, setOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    dispatch(fetchZonesRequest({ page: currentPage, limit: perPage }));
  }, [dispatch, currentPage, perPage]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelectedZone(null);
  };

  const handleOnClose = () => {
    setOpen(false);
    setSelectedZone(null);
  };

  const handleAddButton = () => {
    setSelectedZone(null);
    setOpen(true);
  };

  const handleEditButton = (row) => {
    setSelectedZone(row);
    setOpen(true);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: currentPage - 1, pageSize: perPage }) : updater;
    dispatch(fetchZonesRequest({ page: next.pageIndex + 1, limit: next.pageSize }));
  };

  return (
    <>
      <ZoneTableSection
        zones={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={currentPage - 1}
        pageSize={perPage}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        totalCount={totalCount}
      />
      <ZoneFormDialog
        open={open}
        onClose={handleOnClose}
        initialData={selectedZone}
      />
    </>
  );
}