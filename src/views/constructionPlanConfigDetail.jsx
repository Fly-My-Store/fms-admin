'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ConstructionPlanConfigWizard from 'sections/constructionPlanConfig/ConstructionPlanConfigWizard';
import { fetchPlanConfigByIdRequest } from 'store/constructionPlanConfig/constructionPlanConfigSlice';

export default function ConstructionPlanConfigDetailView() {

  return (
    <>
      <ConstructionPlanConfigWizard />
    </>
  );
}