'use client';
import PropTypes from 'prop-types';

import { useEffect, useState } from 'react';

// next
import { useParams, useRouter } from 'next/navigation';

// material-ui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';

// project imports
import MainCard from 'components/MainCard';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import Loan from 'sections/loan/detail/Loan';

import { APP_DEFAULT_PATH } from 'config';

// assets
import ContainerOutlined from '@ant-design/icons/ContainerOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import { AppstoreOutlined, BuildTwoTone, ContainerTwoTone, InboxOutlined, MailOutlined, MoneyCollectTwoTone, PictureTwoTone, ScheduleTwoTone, TrademarkCircleTwoTone } from '@ant-design/icons';
import { Button, Chip, Divider, List, ListItem, ListItemIcon, ListItemText, Stack, Switch, Typography } from '@mui/material';
import Avatar from 'components/@extended/Avatar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoanByIdRequest, fetchLoanStatsRequest, updateLoanRequest } from 'store/loan/loanSlice';
import CompletionPieChart from 'sections/loan/detail/CompletionPieChart';
import ActivityStatusChart from 'sections/loan/detail/ActivityStatusChart';
import ConstructionPlan from 'sections/loan/detail/ConstructionPlan';
import DisbursalList from 'sections/loan/detail/DisbursalList';
import Gallery from 'sections/loan/detail/Gallery';
import ReportDownload from 'sections/loan/detail/ReportDownload';
import LoanTask from 'sections/loan/detail/LoanTask';
import DisbursalRequestList from 'sections/loan/detail/DisbursalRequestList';
import ConfirmationDialog from 'components/ConfirmationDialog';

// ==============================|| PROFILE - ACCOUNT ||============================== //

export default function LoanDetail({ tab }) {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { id } = params;

  const [value, setValue] = useState(tab);
  const [open, setOpen] = useState(false);

  const { loan, stats } = useSelector((state) => state.loan);
  const handleChange = (event, newValue) => {
    setValue(newValue);
    router.replace(`/loan/${id}/${newValue}`);
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchLoanByIdRequest(id));
      dispatch(fetchLoanStatsRequest(id));
    }
  }, [id, dispatch]);

  const handleGeoRestrictionToggle = () => {
    dispatch(updateLoanRequest({
      id,
      data: { geoRestriction: !loan?.geoRestriction },
    }));
    setOpen(false);
  };

  let breadcrumbTitle = '';
  let breadcrumbHeading = '';

  switch (tab) {
    case 'detail':
      breadcrumbTitle = 'loan-detail';
      breadcrumbHeading = 'loan-detail';
      break;
    case 'construction-plan':
      breadcrumbTitle = 'construction-plan';
      breadcrumbHeading = 'construction-plan';
      break;
    case 'disbursment-request':
      breadcrumbTitle = 'disbursment-request';
      breadcrumbHeading = 'disbursment-request';
      break;
    case 'disbursments':
      breadcrumbTitle = 'disbursments';
      breadcrumbHeading = 'disbursments';
      break;
    case 'gallery':
      breadcrumbTitle = 'gallery';
      breadcrumbHeading = 'gallery';
      break;
    case 'report-download':
      breadcrumbTitle = 'report-download';
      breadcrumbHeading = 'report-download';
      break;
    case 'task':
      breadcrumbTitle = 'tasks';
      breadcrumbHeading = 'tasks';
      break;
    default:
      breadcrumbTitle = 'dashboard';
      breadcrumbHeading = 'dashboard';
      break;
  }

  const breadcrumbLinks = [
    { title: 'home', to: APP_DEFAULT_PATH },
    { title: 'loan', to: '/loan' },
    { title: breadcrumbTitle }
  ];


  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <MainCard border={false} boxShadow>
        <Grid container spacing={3}>
          <Grid size={3} >
            <Grid container spacing={3}>
              <Grid size={12} >
                <MainCard>
                  <Stack spacing={1} sx={{ mb: 2, justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="h5" fontWeight="bold" alignSelf={'center'}>
                      {loan?.loanNumber}
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary">Loan Type</Typography>
                  <Typography mb={1}>{loan?.loanType?.name}</Typography>
                  <Typography color="text.secondary">Branch</Typography>
                  <Typography mb={1}>{loan?.branch?.name}</Typography>
                  <Typography color="text.secondary">Constructed</Typography>
                  <Typography mb={1}>{`${loan?.completedPercent} %`}</Typography>
                  <Typography color="text.secondary">Disbursed</Typography>
                  <Typography >{`${loan?.disbursementPercent} %`}</Typography>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mt={2}>
                    <Typography color="text.secondary">Geo Restriction</Typography>
                    <Switch
                      checked={!!loan?.geoRestriction}
                      onChange={(e) => setOpen(true)}
                      color="primary"
                      size='small'
                    />
                  </Stack>
                </MainCard>
              </Grid>
              <Grid size={12}>
                <MainCard>
                  {stats?.lastDisbursementDate && (
                    <>
                      <Typography color="text.secondary">Last Disbursement Date</Typography>
                      <Typography mb={1}>{new Date(stats.lastDisbursementDate).toLocaleDateString()}</Typography>
                    </>
                  )}

                  {stats?.lastProgressSubmittedDate && (
                    <>
                      <Typography color="text.secondary">Last Progress Submitted</Typography>
                      <Typography mb={1}>{new Date(stats.lastProgressSubmittedDate).toLocaleDateString()}</Typography>
                    </>
                  )}

                  {stats?.lastProgressVerifiedDate && (
                    <>
                      <Typography color="text.secondary">Last Progress Verified</Typography>
                      <Typography mb={1}>{new Date(stats.lastProgressVerifiedDate).toLocaleDateString()}</Typography>
                    </>
                  )}

                  <Typography color="text.secondary">Pending Construction Activities</Typography>
                  <Typography mb={1}>{stats.pendingConstructionActivities || 0}</Typography>

                  <Typography color="text.secondary">Open Disbursement Requests</Typography>
                  <Typography>{stats.openDisbursementRequests || 0}</Typography>
                </MainCard>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={9}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
              <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="account profile tab">
                <Tab label="Detail" value="detail" icon={<ContainerTwoTone />} iconPosition="start" />
                <Tab label="Construction Plan" value="construction-plan" icon={<BuildTwoTone />} iconPosition="start" />
                <Tab label="gallery" value="gallery" icon={<PictureTwoTone />} iconPosition="start" />
                <Tab label="Report download" value="report-download" icon={<PictureTwoTone />} iconPosition="start" />
                <Tab label="disbursment request" value="disbursment-request" icon={<TrademarkCircleTwoTone />} iconPosition="start" />
                <Tab label="disbursments" value="disbursments" icon={<MoneyCollectTwoTone />} iconPosition="start" />
                {/* <Tab label="task" value="task" icon={<ScheduleTwoTone />} iconPosition="start" /> */}
              </Tabs>
            </Box>
            {loan && <Box sx={{ mt: 2.5 }}>
              {tab === 'detail' && <Loan />}
              {tab === 'construction-plan' && <ConstructionPlan loan={loan || {}} property={loan?.property || {}} />}
              {tab === 'gallery' && <Gallery loanId={loan?.id} />}
              {tab === 'report-download' && <ReportDownload loanId={loan?.id} />}
              {tab === 'disbursment-request' && <DisbursalRequestList loanId={loan?.id} />}
              {tab === 'disbursments' && <DisbursalList />}
              {/* {tab === 'task' && <LoanTask />} */}
            </Box>}
          </Grid>
        </Grid>
        <ConfirmationDialog
          open={open}
          title={`${loan?.geoRestriction ? 'Disable' : 'Enable'} Geo Restriction`}
          description={`Are you sure you want to ${loan?.geoRestriction ? 'disable' : 'enable'} geo restriction?`}
          onConfirm={handleGeoRestrictionToggle}
          onCancel={() => setOpen(false)}
        />
      </MainCard>
    </>
  );
}

LoanDetail.propTypes = { tab: PropTypes.string };
