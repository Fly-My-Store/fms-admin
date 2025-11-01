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
import { fetchLoanTypesRequest, fetchStructureTypesRequest } from 'store/loan/loanSlice';
import dayjs from 'dayjs';
import DisbursalForm from '../update/DisbursalForm';
import { formatCurrency } from 'utils/text-formatter';
import { Alert, Box } from '@mui/material';
import DisbursementTable from '../list/DisbursementTable';


export default function DisbursalList() {

  const [open, setOpen] = useState(false);
  const [selectedDisbursal, setSelectedDisbursal] = useState();
  const { loan } = useSelector((state) => state.loan);

  const handleDialogToggle = () => {
    setOpen((prev) => !prev);
    if (open) setSelectedDisbursal(null);
  };

  const handleAddButton = () => {
    setSelectedDisbursal(null);
    setOpen(true);
  };

  const handleEditButton = (row) => {
    setSelectedDisbursal(row);
    setOpen(true);
  };


  if (!loan?.loanDisbursals?.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Alert severity="info">
          No disbursement available for this loan.
        </Alert>
      </Box>
    );
  }


  return (
    < >
      <DisbursementTable
        disbursals={loan?.loanDisbursals || []}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
      />
      <DisbursalForm
        open={open}
        onClose={handleDialogToggle}
        initialData={selectedDisbursal}
        loanId={loan?.id}
        sequence={(loan?.loanDisbursals?.length || 0) + 1}
      />
    </>
  );
}