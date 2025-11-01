'use client';

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS, USER_TYPES } from 'utils/constants';
import useUser from 'hooks/useUser';

import { getBusinessAdminStatsRequest } from 'store/dashboard/dashboardSlice';

export default function BusinessStatsTableSection() {
  const dispatch = useDispatch();
  const user = useUser();

  const { businessStats } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getBusinessAdminStatsRequest());
  }, [dispatch]);

  const columns = useMemo(() => [
    { header: 'Business Name', accessorKey: 'businessName' },
    { header: 'Admin Email', accessorKey: 'adminEmail' },
    { header: 'Total Users', accessorKey: 'totalBusinessUsers' },
    { header: 'Active Users', accessorKey: 'activeBusinessUsers' },
    { header: 'Active Plan Configs', accessorKey: 'activeConstructionPlanConfigs' },
    { header: 'Loan Count', accessorKey: 'loanCount' }
  ], []);

  return (
    <BasicReactTable
      columns={columns}
      data={businessStats || []}
      showActions={false}
      showPagination={false}
    />
  );
}