'use client';

import MainCard from 'components/MainCard';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropertyStructureTypeTableSection from 'sections/propertyStructureType/PropertyStructureTypeTableSection';
import PropertyStructureTypeFormDialog from 'sections/propertyStructureType/PropertyStructureTypeFormDialog';
import { fetchStructureTypesRequest } from 'store/loan/loanSlice';

export default function PropertyStructureTypeView() {
  const dispatch = useDispatch();
  const { structureTypes, loading } = useSelector((state) => state.loan);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(fetchStructureTypesRequest());
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
      <PropertyStructureTypeTableSection
        structureTypes={structureTypes}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
      />
      <PropertyStructureTypeFormDialog open={open} onClose={handleDialogToggle} initialData={selected} />
    </>
  );
}