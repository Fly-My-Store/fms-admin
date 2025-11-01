'use client';

import MainCard from 'components/MainCard';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConstructionActivityTypeTableSection from 'sections/constructionActivityType/ConstructionActivityTypeTableSection';
import ConstructionActivityTypeFormDialog from 'sections/constructionActivityType/ConstructionActivityTypeFormDialog';
import { fetchActivityTypesRequest, updateActivityTypeSequenceRequest } from 'store/constructionActivity/constructionActivitySlice';

export default function ConstructionActivityTypeView() {
  const dispatch = useDispatch();
  const { activityTypes, loading } = useSelector((state) => state.constructionActivity);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(fetchActivityTypesRequest());
  }, [dispatch]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelected(null);
  };

  const handleAddButton = () => {
    setSelected({ sequence: activityTypes.length + 1 });
    setOpen(true);
  };

  const handleEditButton = (row) => {
    setSelected(row);
    setOpen(true);
  };

  const handleUpdateSequence = (data) => {
    dispatch(updateActivityTypeSequenceRequest(data));
  }

  return (
    <>
      <ConstructionActivityTypeTableSection
        loading={loading}
        activityTypes={activityTypes}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        handleUpdateSequence={handleUpdateSequence}
      />
      <ConstructionActivityTypeFormDialog open={open} onClose={handleDialogToggle} initialData={selected} />
    </>
  );
}