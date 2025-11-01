import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import * as yup from 'yup';
// MUI Components
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Grid2 as Grid,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';

// Icons
import { CloseOutlined } from '@ant-design/icons';

// Project Components
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';
import MainCard from 'components/MainCard';
import MediaGrid from './MediaGrid';

import { CONSTRUCTION_PLAN_EVENT_LABELS, DISBURSEMENT_REQUEST_EVENT_ICONS, DISBURSEMENT_REQUEST_EVENT_LABELS, DISBURSEMENT_REQUEST_STATUS, getDisbursementRequestProgressStatus, getDisbursementRequestStatusDialogContent } from 'utils/constants';
import { fetchDisbursalRequestByIdRequest } from 'store/loan/loanSlice';
import { useDispatch, useSelector } from 'react-redux';
import ConfirmationDialog from 'components/ConfirmationDialog';

const validationSchema = yup.object({
  remarks: yup.string().optional(),
});


export default function DisbursalRequestDetails({ open, onClose: handleDrawerClose, updateRequestStatus, requestId }) {

  const dispatch = useDispatch();

  const { disbursalRequestDetail: request, loading } = useSelector(state => state.loan);

  useEffect(() => {
    if (requestId) {
      dispatch(fetchDisbursalRequestByIdRequest(requestId));
    }
  }, [requestId]);

  const creator = request?.creator || {};

  const fullName = [creator.firstName?.trim(), creator.lastName?.trim()]
    .filter(Boolean)
    .join(' ');

  const creatorLabel =
    fullName ||
    creator.email?.trim() ||
    creator.phone?.trim() ||
    '';

  const formik = useFormik({
    initialValues: {
      remarks: '',
      status: '',
      open: false
    },
    validationSchema,
    onSubmit: (values) => {
      if (!values.status) return;
      updateRequestStatus(request.id, values.remarks, values.status);
      onClose();
    },
    enableReinitialize: true
  });

  const { label, color } = getDisbursementRequestProgressStatus(request.requestStatus);
  const { title, message } = getDisbursementRequestStatusDialogContent(formik.values.status);

  const onClose = () => {
    formik.resetForm();
    handleDrawerClose();
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
        <SimpleBar>
          <Box display="flex" flexDirection="column" height="100vh">
            {loading && <LinearProgress sx={{ height: 2 }} />}
            <Stack direction="row" alignItems="center" justifyContent="space-between" p={2}>
              <Typography variant="h4">Disbursement Request</Typography>
              <Stack direction="row" alignItems="center">
                <Chip label={label} size="small" variant="light" color={color} />
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
                <MainCard>
                  <Grid container spacing={3}>
                    <Grid xs={6}>
                      <Typography color="text.secondary" mb={1}>Request Id</Typography>
                      <Typography>{request.requestId}</Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography color="text.secondary" mb={1}>Requested By</Typography>
                      <Typography>{creatorLabel}</Typography>
                    </Grid>
                  </Grid>
                </MainCard>
                {request?.events?.length > 0 && (
                  <MainCard title="Event History">
                    <Stack spacing={2}>
                      {request.events.map((event, index) => (
                        <Box key={index}>
                          <Typography>
                            {DISBURSEMENT_REQUEST_EVENT_ICONS[event.eventId]}
                            {DISBURSEMENT_REQUEST_EVENT_LABELS[event.eventId] || 'Unknown'} at {' '}
                            {dayjs(event.createdAt).format('DD MMM YYYY, hh:mm A')}  {' '}
                            {(() => {
                              const { firstName, lastName, email, phone } = event.creator;
                              if (firstName || lastName) {
                                return `by ${firstName || ''} ${lastName || ''}`.trim();
                              } else if (email) {
                                return `by ${email}`;
                              } else if (phone) {
                                return `by ${phone}`;
                              }
                              return '-';
                            })()}
                          </Typography>
                          {event.notes && (
                            <Typography color="text.secondary">
                              Notes: {event.notes}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </MainCard>
                )}
              </Stack>

            </Box>
            {request.requestStatus === DISBURSEMENT_REQUEST_STATUS.OPEN && (
              <>
                <Divider />
                <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
                  <Stack direction="row" spacing={2} px={2} py={1} alignItems="center">
                    <TextField
                      id="remarks"
                      name="remarks"
                      value={formik.values.remarks}
                      onChange={formik.handleChange}
                      error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                      placeholder="Enter Remarks"
                      fullWidth
                      multiline
                      maxRows={3}
                    />
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        formik.setFieldValue('status', DISBURSEMENT_REQUEST_STATUS.REJECTED, false);
                        formik.setFieldValue('open', true, false);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => {
                        formik.setFieldValue('status', DISBURSEMENT_REQUEST_STATUS.APPROVED, false);
                        formik.setFieldValue('open', true, false);
                      }}
                    >
                      Accept
                    </Button>
                  </Stack>
                </form>
              </>
            )}
          </Box>
        </SimpleBar>
      )}
      <ConfirmationDialog
        open={formik.values.open}
        title={title}
        description={message}
        onConfirm={() => formik.handleSubmit()}
        onCancel={() => formik.setFieldValue('open', false, false)}
      />
    </Drawer>
  );
}

DisbursalRequestDetails.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  updateRequestStatus: PropTypes.func.isRequired,
  request: PropTypes.object.isRequired
};