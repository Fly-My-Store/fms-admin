'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// sections & components
import BusinessTableSection from 'sections/businesses/list/BusinessTableSection';
import BusinessFormDialog from 'sections/businesses/BusinessFormDialog';

// redux
import { fetchBusinessesRequest, clearBusiness } from 'store/business/businessSlice';
import { useRouter } from 'next/navigation';

export function BusinessesView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { businesses, loading } = useSelector((state) => state.business);

  useEffect(() => {
    dispatch(fetchBusinessesRequest());
  }, [dispatch]);

  const handleAddButton = () => {
    dispatch(clearBusiness());
    router.push('/businesses/add');
  };
  const handleEditButton = (row) => {
    router.push(`/businesses/edit/${row.id}`);
  };

  const handleViewButton = (row) => {
    router.push(`/businesses/${row.id}/detail`);
  };

  return (
    <>
      <BusinessTableSection
        businesses={businesses}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        handleViewButton={handleViewButton}
      />
    </>
  );
}

export default BusinessesView;