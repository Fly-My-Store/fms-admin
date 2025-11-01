import PropTypes from 'prop-types';
// material-ui
import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';


// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import SimpleBar from 'components/third-party/SimpleBar';

import IconButton from 'components/@extended/IconButton';

// assets
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import { CheckCircleFilled, EyeFilled } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchConstructionPlanByIdRequest, fetchConstructionPlansRequest, fetchLoanByIdRequest, updatePlanProgressRequest } from 'store/loan/loanSlice';
import dayjs from 'dayjs';
import MediaGrid from './MediaGrid';
import { ACCEPT_CONSTRUCTION_PLAN_PROGRESS, CONSTRUCTION_PLAN_EVENT_ICONS, CONSTRUCTION_PLAN_EVENT_LABELS, getConstructionPlanProgressStatus, getConstructionProgressDialogContent, REJECT_CONSTRUCTION_PLAN_PROGRESS, RESET_CONSTRUCTION_PLAN_PROGRESS, SITE_VERIFIED_CONSTRUCTION_PLAN_PROGRESS } from 'utils/constants';
import { LinearProgress, Link } from '@mui/material';
import ConfirmationDialog from 'components/ConfirmationDialog';



export default function ConstructionPlanDetails({ open, handleDrawerClose, selectedPlan, fetchConstructionPlans }) {

  const dispatch = useDispatch();
  const { constructionPlan, loading } = useSelector(state => state.loan);
  const [remarks, setRemarks] = useState('');
  const [planProgressUpdate, setPlanProgressUpdate] = useState({
    open: false
  });

  useEffect(() => {
    if (selectedPlan?.id) {
      dispatch(fetchConstructionPlanByIdRequest(selectedPlan?.id));
    }
  }, [selectedPlan?.id]);


  const { label, color } = getConstructionPlanProgressStatus(constructionPlan?.progress || '', constructionPlan?.verificationMode);
  const activity = constructionPlan?.constructionPlanActivityConfig?.constructionActivity;
  const type = activity?.activityType?.name || '-';
  const level = activity?.activityLevel?.name || '-';
  const floor = (!constructionPlan || constructionPlan?.floorNumber === 0 || !constructionPlan?.floorNumber) ? '' : `Floor ${constructionPlan.floorNumber}`;
  const progressLabel = ['Yet to Start', 'Submitted', 'Verified'][(constructionPlan?.progress || 1) - 1] || '-';
  const createdDate = constructionPlan?.createdAt ? dayjs(constructionPlan.createdAt).format('DD-MM-YYYY') : '-';

  const handleProgressUpdate = () => {
    dispatch(updatePlanProgressRequest({
      id: selectedPlan.id,
      data: {
        verify: planProgressUpdate.verify,
        remarks: planProgressUpdate.remarks,
        site: planProgressUpdate.site,
        reset: planProgressUpdate.reset,
      }
    }));
    setTimeout(() => {
      fetchConstructionPlans(planProgressUpdate.remarks);
      setRemarks('');
      setPlanProgressUpdate({ open: false });
    }, 500);
  };

  const { title, message } = getConstructionProgressDialogContent(planProgressUpdate);

  const onClose = () => {
    handleDrawerClose();
    setPlanProgressUpdate({ open: false });
    setRemarks('');
  };
  
  return (
    <Drawer
      sx={{
        ml: open ? 3 : 0,
        flexShrink: 0,
        zIndex: 1200,
        overflowX: 'hidden',
        width: { xs: 320, md: '40vw' },
        '& .MuiDrawer-paper': {
          width: { xs: 320, md: '40vw' },
          border: 'none',
          borderRadius: '0px'
        }
      }}
      variant="temporary"
      anchor="right"
      open={open}
      ModalProps={{ keepMounted: true }}
      onClose={onClose}
    >
      {open && (
        <SimpleBar >
          <Box display="flex" flexDirection="column" height="100vh">
            {loading && <LinearProgress sx={{ height: 2 }} />}
            <Stack direction="row" alignItems={'center'} justifyContent={'space-between'} p={2}>
              <Typography variant="h4">{selectedPlan?.nameFloor || selectedPlan?.name}</Typography>
              <Stack direction="row" alignItems={'center'} >
                <Chip
                  label={label}
                  size="small"
                  variant="light"
                  color={color}
                />
                <Tooltip title="Close">
                  <IconButton color="secondary" onClick={onClose} size="small" sx={{ fontSize: '0.875rem' }}>
                    <CloseOutlined />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
            <Divider />
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
              <Stack spacing={3} >
                <MediaGrid media={constructionPlan?.media} showDate={false} />
                <MainCard >
                  <Stack spacing={1}>
                    <Grid container spacing={3}>
                      <Grid size={4}>
                        <Grid container spacing={3}>
                          <Grid size={12}>
                            <Typography color="text.secondary" mb={1}>Activity Type</Typography>
                            <Typography >{type}</Typography>
                          </Grid>
                          <Grid size={12}>

                            <Typography color="text.secondary" mb={1}>Activity Level</Typography>
                            <Typography >{level}</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid size={4}>
                        <Grid container spacing={3}>
                          <Grid size={12}>
                            <Typography color="text.secondary" mb={1}>Weightage</Typography>
                            <Typography >{constructionPlan?.weightage || '-'}%</Typography>
                          </Grid>
                          <Grid size={12}>
                            <Typography color="text.secondary" mb={1}>Generated At</Typography>
                            <Typography >{createdDate}</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Stack>
                </MainCard>

                {constructionPlan?.events?.length > 0 && (
                  <MainCard title="Event History">
                    <Stack spacing={2}>
                      {constructionPlan.events.map((event, index) => (
                        <Box key={index}>
                          <Typography>
                            {CONSTRUCTION_PLAN_EVENT_ICONS[event.eventId]}
                            {CONSTRUCTION_PLAN_EVENT_LABELS[event.eventId] || 'Unknown'} at {' '}
                            {dayjs(event.createdAt).format('DD MMM YYYY, hh:mm A')} {' '}
                            {(() => {
                              const { firstName, lastName, email, phone } = event?.creator || {};
                              if (firstName || lastName) {
                                return `by ${firstName || ''} ${lastName || ''}`.trim();
                              } else if (email) {
                                return `by ${email}`;
                              } else if (phone) {
                                return `by ${phone}`;
                              }
                              return '';
                            })()}
                          </Typography>
                          {event.notes && (
                            <Typography color="text.secondary">
                              Notes: {event.notes}
                            </Typography>
                          )}
                          {event.submittedMediaLat && (
                            <Typography color="text.secondary">
                              Location:{' '}
                              <Link
                                href={`https://www.google.com/maps?q=${event.submittedMediaLat},${event.submittedMediaLng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                              >
                                {`${event.submittedMediaLat}, ${event.submittedMediaLng}`}
                              </Link>
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </MainCard>
                )}
              </Stack>

            </Box>
            {constructionPlan?.progress === 2 && <>
              <Divider />
              <Stack direction={'row'} spacing={3} px={2} py={1} justifyContent={'center'} alignItems={'flex-end'} width={'100%'} bottom={0}>
                <TextField
                  label="Remarks"
                  name="remarks"
                  multiline
                  maxRows={3}
                  value={planProgressUpdate.remarks}
                  onChange={(e) => setPlanProgressUpdate(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Enter remarks here..."
                  fullWidth
                  variant="outlined"
                />
                <Button variant="contained" color="error" onClick={() => setPlanProgressUpdate(prev => ({ ...prev, verify: false, open: true }))}>
                  Reject
                </Button>
                <Button variant="contained" color="success" onClick={() => setPlanProgressUpdate(prev => ({ ...prev, verify: true, open: true }))}>
                  Accept
                </Button>
              </Stack>
            </>}

            {constructionPlan?.progress === 1 && <>
              <Divider />
              <Stack direction={'row'} spacing={3} px={2} py={1} justifyContent={'center'} alignItems={'flex-end'} width={'100%'} bottom={0}>
                <TextField
                  label="Remarks"
                  name="remarks"
                  multiline
                  maxRows={3}
                  value={planProgressUpdate.remarks}
                  onChange={(e) => setPlanProgressUpdate(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Enter remarks here..."
                  fullWidth
                  variant="outlined"
                />
                <Button variant="contained" sx={{ width: '140px' }} color="success" onClick={() => setPlanProgressUpdate(prev => ({ ...prev, verify: true, open: true, site: true }))}>
                  Site Verified
                </Button>
              </Stack>
            </>}

            {constructionPlan?.progress === 3 && <>
              <Divider />
              <Stack direction={'row'} spacing={3} px={2} py={1} justifyContent={'center'} alignItems={'flex-end'} width={'100%'} bottom={0}>
                <TextField
                  label="Remarks"
                  name="remarks"
                  multiline
                  maxRows={3}
                  value={planProgressUpdate.remarks}
                  onChange={(e) => setPlanProgressUpdate(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Enter remarks here..."
                  fullWidth
                  variant="outlined"
                />
                <Button variant="contained" sx={{ width: '160px' }} color='warning' onClick={() => setPlanProgressUpdate(prev => ({ ...prev, open: true, reset: true }))}>
                  Reset Activity
                </Button>
              </Stack>
            </>}
          </Box>

        </SimpleBar>
      )}
      <ConfirmationDialog
        open={planProgressUpdate.open}
        title={title}
        description={message}
        onConfirm={handleProgressUpdate}
        onCancel={() => setPlanProgressUpdate({ open: false })}
      />
    </Drawer>
  );
}

ConstructionPlanDetails.propTypes = { open: PropTypes.bool, handleDrawerClose: PropTypes.func };
