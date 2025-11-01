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
import { Tooltip } from '@mui/material';
import IconButton from 'components/@extended/IconButton';
import DisbursalRequestForm from '../update/DisbursalRequestForm';
import { useRouter } from 'next/navigation';
import { DISBURSEMENT_REQUEST_STATUS } from 'utils/constants';
import DisbursalRequestDetails from '../detail/DisbursalRequestDetails';


export default function DisbursalRequestList({ loanId }) {

  const router = useRouter();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedDisbursalRequest, setSelectedDisbursalRequest] = useState();
  const { disbursalRequests, totalPages, currentPage, perPage, totalCount } = useSelector((state) => state.loan.disbursalRequestData);

  const [requestStatus, setRequestStatus] = useState(1);

  const handleToggle = (value) => {
    setRequestStatus(requestStatus === value ? undefined : value);
  };

  useEffect(() => {
    dispatch(fetchDisbursalRequestsRequest({ page: currentPage, limit: perPage, loanId, requestStatus, }));
  }, [loanId, requestStatus, currentPage, perPage]);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelectedDisbursalRequest(null);
  };

  const handleChangeStatusButton = (request) => {
    setSelectedDisbursalRequest(request);
    setOpen(true);
  };

  const handlePaginationChange = (updater) => {
    const next = typeof updater === 'function' ? updater({ pageIndex: currentPage - 1, pageSize: perPage }) : updater;
    dispatch(fetchDisbursalRequestsRequest({ page: next.pageIndex + 1, limit: next.pageSize, loanId, requestStatus, }));
  };

  const handleUpdateRequestStatus = (values) => {
    dispatch(updateDisbursalRequestRequest({ id: selectedDisbursalRequest.requestId, data: { ...values, requestStatus: selectedDisbursalRequest.requestStatus } }));
    setOpen(false);
    setSelectedDisbursalRequest(null);
  }

  const handleLoanView = (loanId) => {
    router.push(`/loan/${loanId}/detail`);
  };

  const handleDownloadReprt = (id) => {
    dispatch(downloadDisbursementRequestPdfRequest(id));
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
        accessorFn: (row) => {
          switch (row.requestStatus) {
            case DISBURSEMENT_REQUEST_STATUS.OPEN:
              return 'Open';
            case DISBURSEMENT_REQUEST_STATUS.APPROVED:
              return 'Approved';
            case DISBURSEMENT_REQUEST_STATUS.REJECTED:
              return 'Rejected';
            default:
              return 'Unknown';
          }
        }
      },
      {
        header: 'Request Date',
        accessorFn: (row) => row.requestDate ? dayjs(row.requestDate).format('DD-MM-YYYY') : '-'
      },
    ],
    []
  );

  const tableActions = (row) => {
    const status = row.requestStatus;
    return (
      <>
        <Tooltip title="Download Report">
          <IconButton onClick={() => handleDownloadReprt(row.id)}>
            <DownloadOutlined />
          </IconButton>
        </Tooltip>
      </>
    );
  };

  const topActions = () => (
    <>
      <Button
        variant={requestStatus === 1 ? 'contained' : 'outlined'}
        onClick={() => handleToggle(1)}
        size='small'
      >
        Pending
      </Button>
      <Button
        variant={requestStatus === 2 ? 'contained' : 'outlined'}
        onClick={() => handleToggle(2)}
        size='small'
      >
        Approved
      </Button>
      <Button
        variant={requestStatus === 3 ? 'contained' : 'outlined'}
        onClick={() => handleToggle(3)}
        size='small'
      >
        Rejected
      </Button>
    </>
  )


  return (
    < >
      <BasicReactTable
        columns={columns}
        data={disbursalRequests}
        title='Disbursement Request'
        ariaLebel='Add Disbursement'
        tableActions={tableActions}
        subheader={topActions}
        pageIndex={currentPage - 1}
        pageSize={perPage}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
        showPagination={loanId ? false : true}
        totalCount={totalCount}
        onRowClick={handleChangeStatusButton}
        permissionName={'loanDisbursmentRequest'}
      />
      <DisbursalRequestDetails
        open={open}
        onClose={handleDialogToggle}
        updateRequestStatus={handleUpdateRequestStatus}
        requestId={selectedDisbursalRequest?.id}
      />
    </>
  );
}