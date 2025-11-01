'use client';

import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    InputLabel,
    IconButton,
    FormHelperText,
    Select,
    MenuItem,
    Autocomplete
} from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';

import {
    createCityRequest,
    updateCityRequest
} from 'store/location/locationSlice';

const validationSchema = Yup.object({
    name: Yup.string().required('City name is required'),
    code: Yup.string().required('City code is required'),
    stateId: Yup.string().required('State is required'),
    status: Yup.number().required('Status is required').oneOf([1, 2], 'Invalid status')
});

const CityFormDialog = ({ open, onClose, initialData = null }) => {
    const dispatch = useDispatch();
    const { states } = useSelector((state) => state.location);

    const formik = useFormik({
        initialValues: {
            name: '',
            code: '',
            stateId: '',
            status: 1
        },
        validationSchema,
        onSubmit: (values) => {
            const data = { ...values, status: Number(values.status) };
            if (initialData?.id) {
                dispatch(updateCityRequest({ id: initialData.id, data }));
            } else {
                dispatch(createCityRequest(data));
            }
            onClose();
        },
        enableReinitialize: true
    });

    useEffect(() => {
        if (initialData) {
            formik.setValues({
                name: initialData.name || '',
                code: initialData.code || '',
                stateId: initialData.stateId || '',
                status: initialData.status ?? 1
            });
        } else {
            formik.resetForm();
        }
    }, [initialData, open]);

    const selectedState = states.data.find((s) => s.id === formik.values.stateId) || null;

    return (
        <Dialog open={open} onClose={onClose} >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {initialData ? 'Edit City' : 'Add City'}
                <IconButton onClick={onClose}><CloseOutlined /></IconButton>
            </DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Stack spacing={3} width={'400px'}>
                        {['name', 'code'].map((field) => (
                            <Stack key={field} sx={{ gap: 1 }}>
                                <InputLabel>{field[0].toUpperCase() + field.slice(1)}</InputLabel>
                                <TextField
                                    id={field}
                                    name={field}
                                    value={formik.values[field]}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder={`Enter ${field}`}
                                    error={formik.touched[field] && Boolean(formik.errors[field])}
                                />
                                {formik.touched[field] && formik.errors[field] && (
                                    <FormHelperText error>{formik.errors[field]}</FormHelperText>
                                )}
                            </Stack>
                        ))}
                        <Stack sx={{ gap: 1 }}>
                            <InputLabel>State</InputLabel>
                            <Autocomplete
                                options={states.data || []}
                                getOptionLabel={(option) => option.name || ''}
                                value={selectedState}
                                onChange={(e, value) => formik.setFieldValue('stateId', value?.id || '')}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Select State"
                                        error={formik.touched.stateId && Boolean(formik.errors.stateId)}
                                    />
                                )}
                            />
                            {formik.touched.stateId && formik.errors.stateId && (
                                <FormHelperText error>{formik.errors.stateId}</FormHelperText>
                            )}
                        </Stack>
                        <Stack sx={{ gap: 1 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formik.values.status}
                                onChange={formik.handleChange}
                                fullWidth
                            >
                                <MenuItem value={1}>Active</MenuItem>
                                <MenuItem value={2}>Inactive</MenuItem>
                            </Select>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button type="submit" variant="contained">
                        {initialData ? 'Update' : 'Submit'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

CityFormDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    initialData: PropTypes.object
};

export default CityFormDialog;