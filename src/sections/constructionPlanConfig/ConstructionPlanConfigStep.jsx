'use client';

import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import * as yup from 'yup';


import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

import AnimateButton from 'components/@extended/AnimateButton';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoanTypesRequest, fetchStructureTypesRequest } from 'store/loan/loanSlice';
import { FormControl } from '@mui/material';

const validationSchema = yup.object({
    name: yup.string().required('Name is required'),
    description: yup.string().required('Description is required'),
    loanTypeId: yup.string().required('Loan Type is required'),
    structureTypeId: yup.string().required('Structure Type is required'),
    floors: yup.number().required('Floors is required'),
    basement: yup.number().required('Basement is required'),
    residentialFloors: yup.number().required('Residential Floors is required'),
    status: yup.number().oneOf([1, 2], 'Invalid status').required('Status is required'),
});

export default function ConfigStep({
    configData,
    handleNext,
    setErrorIndex,
}) {
    const dispatch = useDispatch();
    const { structureTypes, loanTypes } = useSelector((state) => state.loan);

    useEffect(() => {
        dispatch(fetchStructureTypesRequest({ active: true }));
        dispatch(fetchLoanTypesRequest({ active: true }));
    }, [dispatch]);

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            loanTypeId: '',
            structureTypeId: '',
            floors: 0,
            basement: 0,
            residentialFloors: 0,
            status: 1
        },
        validationSchema,
        onSubmit: (values) => {
            handleNext(values);
        },
        enableReinitialize: true
    });

    useEffect(() => {
        if (configData) {
            formik.setValues({
                name: configData.name || '',
                description: configData.description || '',
                loanTypeId: configData.loanTypeId || '',
                structureTypeId: configData.structureTypeId || '',
                floors: configData.floors || 0,
                basement: configData.basement || 0,
                status: configData.status || 1,
                residentialFloors: configData.residentialFloors || 0
            });
        } else {
            formik.resetForm();
        }
    }, [configData]);

    return (
        < >
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Construction Plan Configuration Details
            </Typography>
            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3} >
                    <Stack direction='row' spacing={3}>
                        <Stack flex={1} spacing={3}>
                            <Stack sx={{ gap: 1 }} >
                                <InputLabel>Name</InputLabel>
                                <TextField
                                    id="name"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                    placeholder="Enter Plan Name"
                                    fullWidth
                                />
                            </Stack>

                            <Stack sx={{ gap: 1 }}>
                                <InputLabel>Description</InputLabel>
                                <TextField
                                    id="description"
                                    name="description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    error={formik.touched.description && Boolean(formik.errors.description)}
                                    helperText={formik.touched.description && formik.errors.description}
                                    placeholder="Enter Description"
                                    fullWidth
                                    multiline
                                    rows={5}
                                />
                            </Stack>
                        </Stack>
                        <Stack flex={1} spacing={3}>
                            <Stack direction='row' spacing={3}>
                                <Stack sx={{ gap: 1 }} flex={1}>
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
                                <Stack sx={{ gap: 1 }} flex={1}>
                                    <InputLabel>Structure Type</InputLabel>
                                    <Select
                                        id="structureTypeId"
                                        name="structureTypeId"
                                        value={formik.values.structureTypeId}
                                        onChange={formik.handleChange}
                                        error={formik.touched.structureTypeId && Boolean(formik.errors.structureTypeId)}
                                        fullWidth
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>Select Structure Type</MenuItem>
                                        {structureTypes.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Stack>
                            </Stack>

                            <Stack direction='row' spacing={3}>
                                <Stack sx={{ gap: 1 }} flex={1}>
                                    <InputLabel>Floors</InputLabel>
                                    <TextField
                                        type="number"
                                        id="floors"
                                        name="floors"
                                        value={formik.values.floors}
                                        onChange={formik.handleChange}
                                        error={formik.touched.floors && Boolean(formik.errors.floors)}
                                        helperText={formik.touched.floors && formik.errors.floors}
                                        placeholder="Floors"
                                        fullWidth
                                    />
                                </Stack>
                                <Stack sx={{ gap: 1 }} flex={1}>
                                    <InputLabel>Basement</InputLabel>
                                    <TextField
                                        type="number"
                                        id="basement"
                                        name="basement"
                                        value={formik.values.basement}
                                        onChange={formik.handleChange}
                                        error={formik.touched.basement && Boolean(formik.errors.basement)}
                                        helperText={formik.touched.basement && formik.errors.basement}
                                        placeholder="Basement"
                                        fullWidth
                                    />
                                </Stack>
                            </Stack>

                            <Stack direction='row' spacing={3}>
                                <Stack sx={{ gap: 1 }} flex={1}>
                                    <InputLabel>Residential Floors</InputLabel>
                                    <TextField
                                        type="number"
                                        id="residentialFloors"
                                        name="residentialFloors"
                                        value={formik.values.residentialFloors}
                                        onChange={formik.handleChange}
                                        error={formik.touched.residentialFloors && Boolean(formik.errors.residentialFloors)}
                                        helperText={formik.touched.residentialFloors && formik.errors.residentialFloors}
                                        placeholder="Residential Floors"
                                        fullWidth
                                    />
                                </Stack>
                                <Stack sx={{ gap: 1 }} flex={1}>
                                    <InputLabel>Status</InputLabel>
                                    <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                                        <Select
                                            name="status"
                                            value={formik.values.status}
                                            onChange={formik.handleChange}
                                            displayEmpty
                                        >
                                            <MenuItem value={1}>Active</MenuItem>
                                            <MenuItem value={2}>Inactive</MenuItem>
                                        </Select>
                                        {formik.touched.status && formik.errors.status && (
                                            <FormHelperText>{formik.errors.status}</FormHelperText>
                                        )}
                                    </FormControl>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                    <Stack direction="row" justifyContent="flex-end">
                        <AnimateButton>
                            <Button variant="contained" type="submit" onClick={() => setErrorIndex(0)}>
                                Next
                            </Button>
                        </AnimateButton>
                    </Stack>
                </Stack>
            </form>
        </>
    );
}

ConfigStep.propTypes = {
    configData: PropTypes.object,
    setConfigData: PropTypes.func,
    handleNext: PropTypes.func,
    setErrorIndex: PropTypes.func,
    loanTypes: PropTypes.array,
    structureTypes: PropTypes.array
};