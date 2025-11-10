'use client';

import { useEffect, useState } from 'react';
import { enqueueSnackbar } from 'notistack';
import __TABLE__ from 'sections/service-areas/ServiceAreasTableSection';
import __FORM__ from 'sections/service-areas/ServiceAreasFormDialog';
import axiosServices from 'utils/axios';

export default function ServiceAreasView() {
  const [rows, setRows] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleDialogToggle = () => { setOpen((p) => !p); if (open) setSelected(null); };
  const handleAddButton = () => { setSelected(null); setOpen(true); };
  const handleEditButton = (row) => { setSelected(row); setOpen(true); };
  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
    setPageIndex(next.pageIndex);
    setPageSize(next.pageSize);
  };

  const load = async () => {
    try {
      const resp = await axiosServices.get('admin/sellers-stores/service-areas', { params: { page: pageIndex + 1, limit: pageSize } });
      const payload = resp?.data || {};
      setRows(payload.data || []);
      setTotalPages(payload?.meta?.totalPages || 1);
    } catch (e) { enqueueSnackbar('Failed to load', { variant: 'error' }); }
  };

  useEffect(() => { load(); }, [pageIndex, pageSize]);

  return (
    <>
      <__TABLE__
        rows={rows}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <__FORM__ open={open} onClose={handleDialogToggle} initialData={selected} onSaved={load} />
    </>
  );
}
