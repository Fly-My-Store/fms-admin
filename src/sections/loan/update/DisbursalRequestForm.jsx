'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import * as yup from 'yup';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';

import {
    addDisbursalRequest,
    updateDisbursalRequest
} from 'store/loan/loanSlice';
import { useFormik } from 'formik';

const validationSchema = yup.object({
    remarks: yup.string().optional(),
});

export default function DisbursalRequestForm({ open, onClose, updateRequestStatus }) {
    const dispatch = useDispatch();
    const formik = useFormik({
        initialValues: {
            remarks: ''
        },
        validationSchema,
        onSubmit: (values) => {
            updateRequestStatus(values);
        },
        enableReinitialize: true
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm'>
            <DialogTitle>{'Disbursement Request Status Update'}</DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent >
                    <Stack spacing={2} mt={1} minWidth={400}>
                        <Stack flex={1} spacing={1}>
                            <InputLabel>Remarks</InputLabel>
                            <TextField
                                id="remarks"
                                name="remarks"
                                value={formik.values.remarks}
                                onChange={formik.handleChange}
                                error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                                placeholder="Enter Remarks"
                                fullWidth
                                multiline
                                rows={3}
                            />
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="contained" type="submit" >
                        Submit
                    </Button>
                </DialogActions>
            </form>


        </Dialog >
    );
}

DisbursalRequestForm.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    updateRequestStatus: PropTypes.func,
};