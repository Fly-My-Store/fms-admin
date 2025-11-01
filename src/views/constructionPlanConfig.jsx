'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConstructionPlanConfigTable from 'sections/constructionPlanConfig/ConstructionPlanConfigTable';
import { fetchPlanConfigsRequest, clearPlanConfigRequest } from 'store/constructionPlanConfig/constructionPlanConfigSlice';

export default function ConstructionPlanConfigView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { planConfigs } = useSelector((state) => state.constructionPlanConfig);

  useEffect(() => {
    dispatch(fetchPlanConfigsRequest());
  }, [dispatch]);

  const handleAddButton = () => {
    dispatch(clearPlanConfigRequest())
    router.push('/construction-plan-config/add');
  };

  const handleEditButton = (row) => {
    router.push(`/construction-plan-config/${row.id}`);
  };

  return (
    <>
      <ConstructionPlanConfigTable
        configs={planConfigs}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
      />
    </>
  );
}