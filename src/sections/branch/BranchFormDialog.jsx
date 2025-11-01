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
    MenuItem,
    Select,
    Autocomplete
} from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';

import {
    createBranchRequest,
    updateBranchRequest,
} from 'store/location/locationSlice';
import AccessValueSelector from 'components/@extended/AccessValueSelector';
import StateSelector from 'components/selector/StateSelector';
import DistrictSelector from 'components/selector/DistrictSelector';
import CitySelector from 'components/selector/CitySelector';
import ZoneSelector from 'components/selector/ZoneSelector';

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    code: Yup.string().required('Code is required'),
    city: Yup.object().nullable().required('City is required'),
    zone: Yup.object().nullable().required('Zone is required'),
    district: Yup.object().nullable().required('District is required'),
    state: Yup.object().nullable().required('State is required'),
    pincode: Yup.string()
        .required('Pincode is required')
        .matches(/^[0-9]{6}$/, 'Pincode must be a 6-digit number'),
    status: Yup.number()
        .required('Status is required')
        .oneOf([1, 2], 'Invalid status')
});

const BranchFormDialog = ({ open, onClose, initialData = null }) => {
    const dispatch = useDispatch();

    const { states, districts, cities, zones } = useSelector((state) => state.location);

    const formik = useFormik({
        initialValues: {
            name: '',
            code: '',
            city: null,
            district: null,
            state: null,
            zone: null,
            pincode: '',
            status: 1
        },
        validationSchema,
        onSubmit: (values) => {
            const data = {
                name: values.name,
                code: values.code,
                pincode: values.pincode,
                status: values.status,
                country: 'India',
                cityId: values.city?.id || null,
                zoneId: values.zone?.id || null,
                districtId: values.district?.id || null,
                stateId: values.state?.id || null
            };
            if (initialData?.id) {
                dispatch(updateBranchRequest({ id: initialData.id, data }));
            } else {
                dispatch(createBranchRequest(data));
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
                city: initialData.city || '',
                zone: initialData.zone || '',
                district: initialData.district || '',
                state: initialData.state || '',
                pincode: initialData.pincode || '',
                status: initialData.status ?? 1
            });
        } else {
            formik.resetForm();
        }
    }, [initialData, open]);

    const renderSelectField = (label, name, options) => (
        <Stack sx={{ gap: 1 }}>
            <InputLabel>{label}</InputLabel>
            <Autocomplete
                options={options}
                getOptionLabel={(option) => option.name || ''}
                value={options.find((opt) => opt.id === formik.values[name]) || null}
                onChange={(_, value) => formik.setFieldValue(name, value?.id || '')}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        name={name}
                        placeholder={`Select ${label}`}
                        error={formik.touched[name] && Boolean(formik.errors[name])}
                        helperText={formik.touched[name] && formik.errors[name]}
                    />
                )}
            />
        </Stack>
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {initialData ? 'Edit Branch' : 'Add Branch'}
                <IconButton onClick={onClose}>
                    <CloseOutlined />
                </IconButton>
            </DialogTitle>

            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Stack spacing={3} direction='row' justifyContent='space-between' alignItems='flex-start'>
                        <Stack spacing={3} minWidth={340}>
                            {['name', 'code', 'pincode'].map((field) => (
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
                                        fullWidth
                                    />
                                    {formik.touched[field] && formik.errors[field] && (
                                        <FormHelperText error>{formik.errors[field]}</FormHelperText>
                                    )}
                                </Stack>
                            ))}
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

                        <Stack spacing={3} minWidth={340}>
                            <Stack sx={{ gap: 1 }}>
                                <InputLabel>{'City'}</InputLabel>
                                <CitySelector
                                    value={formik.values['city'] || null}
                                    onChange={(value) => formik.setFieldValue('city', value)}
                                    textFieldProps={{
                                        error: formik.touched.city && Boolean(formik.errors.city),
                                        helperText: formik.touched.city && formik.errors.city
                                    }}
                                />
                            </Stack>
                            <Stack sx={{ gap: 1 }}>
                                <InputLabel>{'Zone'}</InputLabel>
                                <ZoneSelector
                                    value={formik.values['zone'] || null}
                                    onChange={(value) => formik.setFieldValue('zone', value)}
                                    textFieldProps={{
                                        error: formik.touched.zone && Boolean(formik.errors.zone),
                                        helperText: formik.touched.zone && formik.errors.zone
                                    }}
                                />
                            </Stack>
                            <Stack sx={{ gap: 1 }}>
                                <InputLabel>{'District'}</InputLabel>
                                <DistrictSelector
                                    value={formik.values['district'] || null}
                                    onChange={(value) => formik.setFieldValue('district', value)}
                                    textFieldProps={{
                                        error: formik.touched.district && Boolean(formik.errors.district),
                                        helperText: formik.touched.district && formik.errors.district
                                    }}
                                />
                            </Stack>
                            <Stack sx={{ gap: 1 }}>
                                <InputLabel>{'State'}</InputLabel>
                                <StateSelector
                                    value={formik.values['state'] || null}
                                    onChange={(value) => formik.setFieldValue('state', value)}
                                    textFieldProps={{
                                        error: formik.touched.state && Boolean(formik.errors.state),
                                        helperText: formik.touched.state && formik.errors.state
                                    }}
                                />
                            </Stack>
                        </Stack>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button variant="contained" type="submit">
                        {initialData ? 'Update' : 'Submit'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

BranchFormDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    initialData: PropTypes.object
};

export default BranchFormDialog;