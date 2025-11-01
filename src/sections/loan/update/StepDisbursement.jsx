'use client';

import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { useEffect, useMemo } from 'react';


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
import { formatCurrency } from 'utils/text-formatter';
import DisbursementTable from '../list/DisbursementTable';


export default function StepDisbursement({
    disbursals,
    handleBack,
    handleNext,
    handleAddButton,
    handleEditButton
}) {
    return (
        < >
            <DisbursementTable
                disbursals={disbursals || []}
                handleAddButton={handleAddButton}
                handleEditButton={handleEditButton}
            />
            <Stack direction="row" justifyContent='space-between' width={'100%'} mt={2}>
                <Button variant="outlined" onClick={handleBack}>
                    Back
                </Button>
                <Button variant="contained" onClick={handleNext}>
                    Next
                </Button>
            </Stack>
        </>
    );
}

StepDisbursement.propTypes = {
    handleBack: PropTypes.func,
    handleNext: PropTypes.func,
    setErrorIndex: PropTypes.func,
};