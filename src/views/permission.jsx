'use client';

import MainCard from 'components/MainCard';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PermissionTableSection from 'sections/permission/PermissionTableSection';
import PermissionFormDialog from 'sections/permission/PermissionFormDialog';
import { fetchPermissionsRequest } from 'store/rolePermission/rolePermissionSlice';

export function Permission() {
  const dispatch = useDispatch();
  const { permissions, loading } = useSelector((state) => state.rolePermission);
  const [open, setOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);

  useEffect(() => {
    dispatch(fetchPermissionsRequest());
  }, [dispatch]);

  const handleDialogToggle = () => setOpen((prev) => !prev);

  const handleAddButton = () => {
    setSelectedPermission(null);
    handleDialogToggle();
  };

  const handleEditButton = (row) => {
    setSelectedPermission(row);
    handleDialogToggle();
  };

  return (
    <>
      <PermissionTableSection
        permissions={permissions}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
      />

      <PermissionFormDialog
        open={open}
        onClose={handleDialogToggle}
        initialData={selectedPermission}
      />
    </>
  );
}

export default Permission;