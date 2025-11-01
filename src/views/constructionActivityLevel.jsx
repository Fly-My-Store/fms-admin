'use client';

import MainCard from 'components/MainCard';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConstructionActivityLevelTableSection from 'sections/constructionActivityLevel/ConstructionActivityLevelTableSection';
import ConstructionActivityLevelFormDialog from 'sections/constructionActivityLevel/ConstructionActivityLevelFormDialog';
import { fetchActivityLevelsRequest } from 'store/constructionActivity/constructionActivitySlice';

export default function ConstructionActivityLevelView() {
  const dispatch = useDispatch();
  const { activityLevels, loading } = useSelector((state) => state.constructionActivity);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    dispatch(fetchActivityLevelsRequest());
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
      <ConstructionActivityLevelTableSection
        activityLevels={activityLevels}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
      />
      <ConstructionActivityLevelFormDialog open={open} onClose={handleDialogToggle} initialData={selected} />
    </>
  );
}