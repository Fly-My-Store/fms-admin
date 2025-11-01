'use client';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import useUser from 'hooks/useUser';
import AnalyticsSummary from 'sections/dashboard/AnalyticsSummary';
import BusinessStatsTableSection from 'sections/dashboard/BusinessStatsTableSection';
import ConstructionPlanSummary from 'sections/dashboard/ConstructionPlanSummary';
import LoanSummary from 'sections/dashboard/LoanSummary';
import Matrics from 'sections/dashboard/Matrics';
import { USER_TYPES } from 'utils/constants';

// ==============================|| DASHBOARD ||============================== //

export default function Dashboard() {
  const user = useUser();

  if (user.role === 'ADMIN') {
    return <>
     
    </>
  }

  return (
    <>
      <LoanSummary />
      {/* <ConstructionPlanSummary /> */}
      <AnalyticsSummary />
    </>
  );
}
