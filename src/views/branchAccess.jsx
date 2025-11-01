'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// sections & components
import BranchAccessTableSection from 'sections/branchAccess/BranchAccessTableSection';
import BranchAccessFormDialog from 'sections/branchAccess/BranchAccessFormDialog';

// redux
import { fetchBranchAccessesRequest } from 'store/branchAccess/branchAccessSlice';

export function BranchAccessView() {
  const dispatch = useDispatch();
  const { branchAccesses } = useSelector((state) => state.branchAccess);
  const [open, setOpen] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState(null);

  useEffect(() => {
    dispatch(fetchBranchAccessesRequest());
  }, [dispatch]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelectedAccess(null);
  };

  const handleAddButton = () => {
    setSelectedAccess(null);
    setOpen(true);
  };

  const handleEditButton = (row) => {
    setSelectedAccess(row);
    setOpen(true);
  };

  return (
    <>
      <BranchAccessTableSection
        branchAccessList={branchAccesses}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
      />
      <BranchAccessFormDialog
        open={open}
        onClose={handleDialogToggle}
        initialData={selectedAccess}
      />
    </>
  );
}

export default BranchAccessView;