'use client';

import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { useEffect, useMemo, useState } from 'react';


import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

import BasicReactTable from 'components/tables/basicTable';
import AnimateButton from 'components/@extended/AnimateButton';
import { useDispatch, useSelector } from 'react-redux';
import { downloadDisbursementRequestPdfRequest, fetchDisbursalRequestsRequest, updateDisbursalRequestRequest } from 'store/loan/loanSlice';
import dayjs from 'dayjs';
import { CheckOutlined, CloseOutlined, DownloadOutlined, EyeFilled } from '@ant-design/icons';
import { Alert, Box, Chip, Tooltip } from '@mui/material';
import IconButton from 'components/@extended/IconButton';
import DisbursalRequestForm from '../update/DisbursalRequestForm';
import { useRouter } from 'next/navigation';
import { DISBURSEMENT_REQUEST_STATUS, getDisbursementRequestProgressStatus } from 'utils/constants';
import DisbursalRequestDetails from './DisbursalRequestDetails';


export default function DisbursalRequestList({ loanId }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedDisbursalRequest, setSelectedDisbursalRequest] = useState();
  const loanState = useSelector((state) => state.loan);
  const { disbursalRequestData, loan } = loanState;
  const { disbursalRequests, totalPages, currentPage, perPage, totalCount } = disbursalRequestData;


  useEffect(() => {
    dispatch(fetchDisbursalRequestsRequest({ page: currentPage, limit: perPage, loanId }));
  }, [loanId, currentPage, perPage]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelectedDisbursalRequest(null);
  };

  const handleChangeStatusButton = (request) => {
    setSelectedDisbursalRequest(request);
    setOpen(true);
  };


  const handleUpdateRequestStatus = (id, remarks, requestStatus) => {
    dispatch(updateDisbursalRequestRequest({ id, data: { remarks, requestStatus } }));
  }

  const handleLoanView = (loanId) => {
    router.push(`/loan/${loanId}/detail`);
  };

  const handleDownloadReprt = (id) => {
    dispatch(downloadDisbursementRequestPdfRequest({
      id,
      params: { loanNumber: loan?.loanNumber }
    }));
  }

  const columns = useMemo(
    () => [
      {
        header: 'Request Id',
        accessorFn: (row) => row.requestId,
      },
      {
        header: 'Requested By',
        accessorFn: (row) => {
          const creator = row?.creator || {};
          const fullName = [creator.firstName?.trim(), creator.lastName?.trim()]
            .filter(Boolean)
            .join(' ');
          const creatorLabel =
            fullName ||
            creator.email?.trim() ||
            creator.phone?.trim() ||
            '';
          return creatorLabel;
        }
      },
      {
        header: 'Request Status',
        accessorKey: 'requestStatus',
        cell: ({ getValue }) => {
          const value = getValue();
          const { label, color } = getDisbursementRequestProgressStatus(value);
          return (
            <Chip
              label={label}
              size="small"
              variant="light"
              color={color}
            />
          );
        }
      },
      {
        header: 'Request Date',
        accessorFn: (row) => row.requestDate ? dayjs(row.requestDate).format('DD-MM-YYYY') : '-'
      },
    ],
    []
  );

  const tableActions = (row, disabled) => {
    const status = row.requestStatus;
    return (
      <>
        <Tooltip title={disabled ? "DRF can not be downloaded for closed requests." : "Download Report"}>
          <IconButton onClick={() => handleDownloadReprt(row.id)} disabled={disabled}>
            <DownloadOutlined />
          </IconButton>
        </Tooltip>
      </>
    );
  };


  const openDisbursements = disbursalRequests.filter(item => item.requestStatus === DISBURSEMENT_REQUEST_STATUS.OPEN);
  const closedDisbursements = disbursalRequests.filter(item => item.requestStatus !== DISBURSEMENT_REQUEST_STATUS.OPEN);

  if (!disbursalRequests || disbursalRequests.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Alert severity="info">
          No disbursement requests available for this loan.
        </Alert>
      </Box>
    );
  }


  return (
    <Stack spacing={2}>
      {openDisbursements.length > 0 && <BasicReactTable
        columns={columns}
        data={openDisbursements}
        title='Open Requests'
        tableActions={(row) => tableActions(row, false)}
        onRowClick={handleChangeStatusButton}
        showPagination={false}
      />}
      {closedDisbursements.length > 0 && <BasicReactTable
        columns={columns}
        data={closedDisbursements}
        title='Past closed Requests'
        tableActions={(row) => tableActions(row, true)}
        showPagination={false}
        onRowClick={handleChangeStatusButton}
      />}
      <DisbursalRequestDetails
        open={open}
        onClose={handleDialogToggle}
        updateRequestStatus={handleUpdateRequestStatus}
        requestId={selectedDisbursalRequest?.id}
      />
    </Stack>
  );
}