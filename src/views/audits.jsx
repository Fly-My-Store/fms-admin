'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import { actions as audit } from 'store/audit/slice';
import AuditsTableSection from 'sections/audits/AuditsTableSection';
import AuditsFormDialog from 'sections/audits/AuditsFormDialog';

export function AuditsView() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.adminAudit || {});
  const list = state.audits || { rows: [], meta: { page: 1, pageSize: 20, totalPages: 1 }, loading: false, error: null };
  const { rows: data = [], meta: { page = 1, pageSize = 20, totalPages = 1 } = {}, error } = list;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(audit.auditsListRequest({ params: { page, limit: pageSize } }));
  }, [dispatch]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
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
    const next = typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
    dispatch(audit.auditsListRequest({ params: { page: next.pageIndex + 1, limit: next.pageSize } }));
  };

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
    }
  }, [error]);

  return (
    <>
      <AuditsTableSection
        rows={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={page - 1}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <AuditsFormDialog open={open} onClose={handleDialogToggle} initialData={selected} />
    </>
  );
}

export default AuditsView;
