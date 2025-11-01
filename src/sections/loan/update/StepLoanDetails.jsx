'use client';

import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import * as yup from 'yup';
import dayjs from 'dayjs';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import AnimateButton from 'components/@extended/AnimateButton';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoanTypesRequest } from 'store/loan/loanSlice';
import BranchSelector from 'components/selector/BranchSelector';
import { formatCurrency, parseCurrency, isFormattedNumber } from 'utils/text-formatter';

const validationSchema = yup.object({
    loanNumber: yup.string().required('Loan Number is required'),
    loanTypeId: yup.string().required('Loan Type is required'),
    branch: yup.object().nullable().required('Branch is required'),
    sanctionedAmount: isFormattedNumber('Sanction Amount'),
    landValue: isFormattedNumber('Land Value'),
    propertyValue: isFormattedNumber('Property Value'),
    constructionValue: isFormattedNumber('Construction Value'),
    ltv: yup
        .number()
        .typeError('Must be a number')
        .min(0, 'LTV must be at least 0')
        .max(100, 'LTV must be at most 100')
        .required('LTV is required'),
    sanctionedDate: yup
        .date()
        .typeError('Sanction Date is required')
        .required('Sanction Date is required'),
});

export default function StepLoanDetails({
    loanFormData,
    handleLoanDetail,
    handleBack,
    setErrorIndex
}) {
    const dispatch = useDispatch();
    const { loanTypes } = useSelector((state) => state.loan);

    useEffect(() => {
        dispatch(fetchLoanTypesRequest({ active: true }));
    }, [dispatch]);

    const formik = useFormik({
        initialValues: {
            loanNumber: '',
            loanTypeId: '',
            branch: null,
            sanctionedAmount: '',
            sanctionedDate: '',
            landValue: '',
            propertyValue: '',
            constructionValue: '',
            ltv: ''
        },
        validationSchema,
        onSubmit: (values) => {
            const formattedValues = {
                ...values,
                branchId: values.branch.id,
                branch: values.branch,
                city: values.branch.city?.name || '',
                state: values.branch.state?.name || '',
                district: values.branch.district?.name || '',
                sanctionedDate: values.sanctionedDate ? dayjs(values.sanctionedDate).format('YYYY-MM-DD') : '',
                sanctionedAmount: parseFloat(parseCurrency(values.sanctionedAmount)),
                landValue: parseFloat(parseCurrency(values.landValue)),
                propertyValue: parseFloat(parseCurrency(values.propertyValue)),
                constructionValue: parseFloat(parseCurrency(values.constructionValue))
            };
            handleLoanDetail(formattedValues);
        },
        enableReinitialize: true
    });

    useEffect(() => {
        if (loanFormData) {
            formik.setValues({
                loanNumber: loanFormData?.loanNumber ?? '',
                loanTypeId: loanFormData?.loanTypeId ?? '',
                branch: loanFormData?.branch,
                sanctionedAmount: formatCurrency(loanFormData?.sanctionedAmount ?? ''),
                sanctionedDate: loanFormData?.sanctionedDate ? dayjs(loanFormData.sanctionedDate).format('YYYY-MM-DD') : '',
                landValue: formatCurrency(loanFormData?.landValue ?? ''),
                propertyValue: formatCurrency(loanFormData?.propertyValue ?? ''),
                constructionValue: formatCurrency(loanFormData?.constructionValue ?? ''),
                ltv: loanFormData?.ltv ?? ''
            });
        } else {
            formik.resetForm();
        }
    }, [loanFormData]);

    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Loan Details
            </Typography>
            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                    <Stack direction="row" spacing={3}>
                        <Stack flex={1} spacing={1}>
                            <InputLabel>Loan Number</InputLabel>
                            <TextField
                                id="loanNumber"
                                name="loanNumber"
                                value={formik.values.loanNumber}
                                onChange={formik.handleChange}
                                error={formik.touched.loanNumber && Boolean(formik.errors.loanNumber)}
                                placeholder="Enter Loan Number"
                                fullWidth
                            />
                        </Stack>
                        <Stack flex={1} spacing={1}>
                            <InputLabel>Branch</InputLabel>
                            <BranchSelector
                                value={formik.values['branch'] || null}
                                onChange={(value) => formik.setFieldValue('branch', value)}
                                textFieldProps={{
                                    error: formik.touched.branch && Boolean(formik.errors.branch),
                                    helperText: formik.touched.branch && formik.errors.branch
                                }}
                            />
                        </Stack>

                        <Stack flex={1} spacing={1}>
                            <InputLabel>Loan Type</InputLabel>
                            <Select
                                id="loanTypeId"
                                name="loanTypeId"
                                value={formik.values.loanTypeId}
                                onChange={formik.handleChange}
                                error={formik.touched.loanTypeId && Boolean(formik.errors.loanTypeId)}
                                fullWidth
                                displayEmpty
                            >
                                <MenuItem value="" disabled>Select Loan Type</MenuItem>
                                {loanTypes.map((item) => (
                                    <MenuItem key={item.id} value={item.id}>
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={3}>
                        {['landValue', 'constructionValue', 'propertyValue'].map((field) => (
                            <Stack key={field} flex={1} spacing={1}>
                                <InputLabel>{field.replace(/([A-Z])/g, ' $1')}</InputLabel>
                                <TextField
                                    id={field}
                                    name={field}
                                    value={formik.values[field]}
                                    onChange={(e) => formik.setFieldValue(field, formatCurrency(e.target.value))}
                                    error={formik.touched[field] && Boolean(formik.errors[field])}
                                    placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1')}`}
                                    fullWidth
                                />
                            </Stack>
                        ))}
                    </Stack>

                    <Stack direction="row" spacing={3}>
                        <Stack flex={1} spacing={1}>
                            <InputLabel>Sanctioned Amount</InputLabel>
                            <TextField
                                id="sanctionedAmount"
                                name="sanctionedAmount"
                                value={formik.values.sanctionedAmount}
                                onChange={(e) => formik.setFieldValue('sanctionedAmount', formatCurrency(e.target.value))}
                                error={formik.touched.sanctionedAmount && Boolean(formik.errors.sanctionedAmount)}
                                placeholder="Enter Sanction Amount"
                                fullWidth
                            />
                        </Stack>

                        <Stack flex={1} spacing={1}>
                            <InputLabel>Sanctioned Date</InputLabel>
                            <TextField
                                type="date"
                                id="sanctionedDate"
                                name="sanctionedDate"
                                value={formik.values.sanctionedDate}
                                onChange={formik.handleChange}
                                error={formik.touched.sanctionedDate && Boolean(formik.errors.sanctionedDate)}
                                fullWidth
                            />
                        </Stack>
                        <Stack flex={1} spacing={1}>
                            <InputLabel>LTV(%)</InputLabel>
                            <TextField
                                type="number"
                                id="ltv"
                                name="ltv"
                                value={formik.values.ltv}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,3}$/.test(value) && (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100))) {
                                        formik.setFieldValue("ltv", value);
                                    }
                                }}
                                error={formik.touched.ltv && Boolean(formik.errors.ltv)}
                                placeholder="Enter LTV"
                                fullWidth
                                slotProps={{
                                    input: {
                                        min: 0,
                                        max: 100,
                                        step: 1,
                                        inputMode: 'numeric'
                                    }
                                }}
                            />
                        </Stack>
                    </Stack>
                    <Stack direction="row" justifyContent='space-between' width={'100%'}>
                        <Button variant="outlined" onClick={handleBack}>
                            Back
                        </Button>
                        <Button variant="contained" type="submit" onClick={() => setErrorIndex(1)}>
                            Next
                        </Button>
                    </Stack>
                </Stack>
            </form>
        </>
    );
}

StepLoanDetails.propTypes = {
    handleBack: PropTypes.func,
    handleLoanDetail: PropTypes.func,
    setErrorIndex: PropTypes.func
};