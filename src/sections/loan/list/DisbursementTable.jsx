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


export default function DisbursementTable({
    disbursals,
    handleEditButton,
    handleAddButton
}) {

    const totalRow = useMemo(() => {
        const amount = disbursals.reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);
        return {
            disbursementDate: '',
            amount,
            hideEdit: true,
        };
    }, [disbursals]);

    const dataWithTotal = useMemo(() => [...disbursals, totalRow], [disbursals, totalRow]);

    const columns = useMemo(
        () => [
            {
                header: 'Disbursement Date',
                accessorFn: (row) => row.disbursementDate ? dayjs(row.disbursementDate).format('DD-MM-YYYY') : 'Total'
            },
            {
                header: 'Disbursement Amount',
                accessorFn: (row) => `₹ ${formatCurrency(row.amount || 0)}`,
            }
        ],
        []
    );

    return (
        <BasicReactTable {...{
            columns,
            data: dataWithTotal,
            title: 'Loan Disbursements',
            ariaLebel: 'Add Disbursement',
            handleEditButton,
            handleAddButton,
            showActions: handleAddButton ? true : false,
            showPagination: false,
            permissionName: 'disbursement',
        }} />
    );
}

DisbursementTable.propTypes = {
};