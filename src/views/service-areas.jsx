'use client';

import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import ServiceAreasTableSection from 'sections/service-areas/ServiceAreasTableSection';
import ServiceAreasFormDialog from 'sections/service-areas/ServiceAreasFormDialog';
import { listAllServiceAreas } from 'api/sellersStores';

export default function ServiceAreasView() {
  const [rows, setRows] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleDialogToggle = () => {
    setOpen((p) => !p);
    if (open) setSelected(null);
  };
  const handleAddButton = () => {
    setSelected(null);
    setOpen(true);
  };
  const handleEditButton = (row) => {
    setSelected(row);
    setOpen(true);
  };
  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
    setPageIndex(next.pageIndex);
    setPageSize(next.pageSize);
  };

  const load = async () => {
    try {
      const payload = await listAllServiceAreas({ page: pageIndex + 1, limit: pageSize });
      setRows(payload.data || []);
      setTotalPages(payload?.meta?.totalPages || 1);
    } catch (e) {
      enqueueSnackbar('Failed to load', { variant: 'error' });
    }
  };

  useEffect(() => {
    load();
  }, [pageIndex, pageSize]);

  return (
    <>
      <ServiceAreasTableSection
        rows={rows}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <ServiceAreasFormDialog open={open} onClose={handleDialogToggle} initialData={selected} onSaved={load} />
    </>
  );
}
