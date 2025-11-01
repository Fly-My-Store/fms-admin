'use client';

import MainCard from 'components/MainCard';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoanTypeTableSection from 'sections/loanType/LoanTypeTableSection';
import LoanTypeFormDialog from 'sections/loanType/LoanTypeFormDialog';
import { fetchLoanTypesRequest } from 'store/loan/loanSlice';

export default function LoanTypeView() {
  const dispatch = useDispatch();
  const { loanTypes, loading } = useSelector((state) => state.loan);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(fetchLoanTypesRequest());
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

  return (
    <>
      <LoanTypeTableSection
        loanTypes={loanTypes}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
      />
      <LoanTypeFormDialog open={open} onClose={handleDialogToggle} initialData={selected} />
    </>
  );
}