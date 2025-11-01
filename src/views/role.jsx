'use client';

import MainCard from 'components/MainCard';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RoleTableSection from 'sections/role/RoleTableSection';
import RoleFormDialog from 'sections/role/RoleFormDialog';
import { fetchPermissionsRequest, fetchRolesRequest } from 'store/rolePermission/rolePermissionSlice';
import { USER_TYPES } from 'utils/constants';

export function Role() {
  const dispatch = useDispatch();
  const { roles, permissions, loading } = useSelector((state) => state.rolePermission);

  const { user } = useSelector((s) => s.auth || {});

  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    dispatch(fetchRolesRequest());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPermissionsRequest({ scope: user?.type }));
  }, [dispatch, user?.type]);

  const handleDialogToggle = () => setOpen((prev) => !prev);

  const handleAddButton = () => {
    setSelectedRole(null);
    handleDialogToggle();
  };

  const handleEditButton = (row) => {
    console.log(row);
    setSelectedRole(row);
    handleDialogToggle();
  };

  return (
    <>
      <RoleTableSection
        roles={roles}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
      />

      <RoleFormDialog
        open={open}
        onClose={handleDialogToggle}
        initialData={selectedRole}
      />
    </>
  );
}

export default Role;