'use client';

import MainCard from 'components/MainCard';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConstructionActivityTableSection from 'sections/constructionActivity/ConstructionActivityTableSection';
import ConstructionActivityFormDialog from 'sections/constructionActivity/ConstructionActivityFormDialog';
import { fetchActivitiesRequest, updateActivitySequenceRequest } from 'store/constructionActivity/constructionActivitySlice';

export default function ConstructionActivityView() {
  const dispatch = useDispatch();
  const { activities, loading } = useSelector((state) => state.constructionActivity);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(fetchActivitiesRequest({ sortByTypeSequence: false }));
  }, [dispatch]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelected(null);
  };

  const handleAddButton = () => {
    setSelected({ sequence: activities.length + 1 });
    setOpen(true);
  };

  const handleEditButton = (row) => {
    setSelected(row);
    setOpen(true);
  };

  const handleUpdateSequence = (data) => {
    dispatch(updateActivitySequenceRequest(data));
  }
  const data = [...activities].sort((a, b) => a.sequence - b.sequence);
  
  return (
    <>
      <ConstructionActivityTableSection
        loading={loading}
        activities={data}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        handleUpdateSequence={handleUpdateSequence}
      />
      <ConstructionActivityFormDialog open={open} onClose={handleDialogToggle} initialData={selected} />
    </>
  );
}