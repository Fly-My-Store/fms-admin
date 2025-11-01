'use client';

import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';

import {
    addDisbursalRequest,
    updateDisbursalRequest
} from 'store/loan/loanSlice';
import { formatCurrency, isFormattedNumber, parseCurrency } from 'utils/text-formatter';

const validationSchema = Yup.object({
    amount: isFormattedNumber('Disbursement Amount'),
    disbursementDate: Yup.date()
        .typeError('Disbursement date is required')
        .required('Disbursement date is required')
});

export default function DisbursalForm({ open, onClose, initialData = null, loanId, firstDisbursement, sequence }) {
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            amount: '',
            disbursementDate: ''
        },
        validationSchema,
        onSubmit: (values) => {
            const payload = {
                loanId,
                ...values,
                amount: parseFloat(parseCurrency(values.amount)),
                disbursementDate: dayjs(values.disbursementDate).format('YYYY-MM-DD'),
                firstDisbursement
            };

            if (initialData?.id) {
                dispatch(updateDisbursalRequest({ id: initialData.id, data: payload }));
            } else {
                dispatch(addDisbursalRequest({ ...payload, sequence }));
            }
            onClose();
        },
        enableReinitialize: true
    });

    useEffect(() => {
        if (initialData) {
            formik.setValues({
                amount: formatCurrency(initialData?.amount ?? ''),
                disbursementDate: initialData.disbursementDate
                    ? dayjs(initialData.disbursementDate).format('YYYY-MM-DD')
                    : ''
            });
        } else {
            formik.resetForm();
        }
    }, [initialData, open]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm">
            <DialogTitle>{initialData ? 'Edit Loan Disbursement' : 'Add Loan Disbursement'}</DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Stack spacing={2} mt={1} width={'400px'}>
                        <Stack sx={{ gap: 1 }}>
                            <InputLabel> Amount</InputLabel>
                            <TextField
                                name="amount"
                                placeholder="Enter Disbursement Amount"
                                value={formik.values.amount}
                                onChange={(e) => {
                                    console.log('Amount change:', e.target.value);
                                    formik.setFieldValue('amount', formatCurrency(e.target.value))
                                }}
                                onBlur={formik.handleBlur}
                                error={formik.touched.amount && Boolean(formik.errors.amount)}
                                fullWidth
                            />
                            {formik.touched.amount && formik.errors.amount && (
                                <FormHelperText error>{formik.errors.amount}</FormHelperText>
                            )}
                        </Stack>

                        <Stack sx={{ gap: 1 }}>
                            <InputLabel>Disbursement Date</InputLabel>
                            <TextField
                                name="disbursementDate"
                                type="date"
                                value={formik.values.disbursementDate}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.disbursementDate && Boolean(formik.errors.disbursementDate)}
                                fullWidth
                            />
                            {formik.touched.disbursementDate && formik.errors.disbursementDate && (
                                <FormHelperText error>{formik.errors.disbursementDate}</FormHelperText>
                            )}
                        </Stack>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="contained">
                        {initialData ? 'Update' : 'Submit'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

DisbursalForm.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    initialData: PropTypes.object,
    loanId: PropTypes.string.isRequired
};