'use client';

import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
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
    updateDisbursalRequest,
    updatePropertyRequest
} from 'store/loan/loanSlice';
import { formatCurrency, isFormattedNumber, parseCurrency } from 'utils/text-formatter';
import { IconButton } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';

const validationSchema = yup.object({
    address: yup.string().required('Address is required'),
    lat: yup.number().required('Latitude is required'),
    lng: yup.number().required('Longitude is required')
});

export default function PropertyForm({ open, onClose, initialData = null }) {
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            name: '',
            address: '',
            lat: '',
            lng: ''
        },
        validationSchema,
        onSubmit: (values) => {
            dispatch(updatePropertyRequest({ id: initialData.id, data: values }));
            onClose();
        },
        enableReinitialize: true
    });

    useEffect(() => {
        if (initialData) {
            formik.setValues({
                name: initialData?.name ?? '',
                address: initialData?.address ?? '',
                lng: initialData?.lng ?? '',
                lat: initialData?.lat ?? ''
            });
        } else {
            formik.resetForm();
        }
    }, [initialData, open]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {'Edit Property'}
                <IconButton onClick={onClose}>
                    <CloseOutlined />
                </IconButton>
            </DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Stack spacing={2} mt={1} width={400}>
                        <Stack spacing={1}>
                            <InputLabel>Name</InputLabel>
                            <TextField
                                id="name"
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                placeholder="Enter Name"
                                fullWidth
                            />
                            {formik.touched.name && formik.errors.name && (
                                <FormHelperText error>{formik.errors.name}</FormHelperText>
                            )}
                        </Stack>

                        <Stack spacing={1}>
                            <InputLabel>Address</InputLabel>
                            <TextField
                                id="address"
                                name="address"
                                value={formik.values.address}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.address && Boolean(formik.errors.address)}
                                placeholder="Enter Address"
                                fullWidth
                                multiline
                            />
                            {formik.touched.address && formik.errors.address && (
                                <FormHelperText error>{formik.errors.address}</FormHelperText>
                            )}
                        </Stack>

                        <Stack spacing={1}>
                            <InputLabel>Latitude</InputLabel>
                            <TextField
                                type="number"
                                name="lat"
                                value={formik.values.lat}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.lat && Boolean(formik.errors.lat)}
                                placeholder="Latitude"
                                fullWidth
                            />

                            {formik.touched.address && formik.errors.address && (
                                <FormHelperText error>{formik.errors.address}</FormHelperText>
                            )}
                        </Stack>

                        <Stack spacing={1}>
                            <InputLabel>Longitude</InputLabel>
                            <TextField
                                type="number"
                                name="lng"
                                value={formik.values.lng}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.lng && Boolean(formik.errors.lng)}
                                placeholder="Longitude"
                                fullWidth
                            />
                            {formik.touched.address && formik.errors.address && (
                                <FormHelperText error>{formik.errors.address}</FormHelperText>
                            )}
                        </Stack>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button type="submit" variant="contained">
                        {'Update'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

PropertyForm.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    initialData: PropTypes.object,
    propertyId: PropTypes.string.isRequired
};