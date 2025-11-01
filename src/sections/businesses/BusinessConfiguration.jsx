'use client';

import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';

// MUI components
import { Stack, TextField, Checkbox, FormControlLabel, Button, Typography, Paper, InputLabel, Switch } from '@mui/material';

// Redux actions
import { fetchBusinessByIdRequest, updateBusinessConfigurationRequest, upsertBusinessConfigRequest } from 'store/business/businessSlice';
import MainCard from 'components/MainCard';
import { enqueueSnackbar } from 'notistack';

// Validation schema
const validationSchema = yup.object({
    geoRestrictionRadius: yup
        .number()
        .typeError('Must be a number')
        .min(0, 'Cannot be negative')
        .nullable(),
    progressSubmitNoPlanGapTime: yup
        .number()
        .typeError('Must be a number')
        .min(0, 'Cannot be negative')
        .nullable(),
});

export default function BusinessConfiguration() {
    const dispatch = useDispatch();
    const { business } = useSelector((state) => state.business);
    const configuration = business?.businessConfiguration;

    const formik = useFormik({
        initialValues: {
            geoRestrictionRadius: '',
            canSubmitProgressNoPlan: false,
            progressSubmitNoPlanGapTime: ''
        },
        validationSchema,
        onSubmit: (values) => {
            dispatch(upsertBusinessConfigRequest(values));
            setTimeout(() => {
                enqueueSnackbar('Configuration Updated', { variant: 'success' });
            }, 500);
        },
        enableReinitialize: true
    });

    useEffect(() => {
        dispatch(fetchBusinessByIdRequest());

    }, [dispatch]);

    useEffect(() => {
        if (configuration) {
            formik.setValues({
                geoRestrictionRadius: configuration.geoRestrictionRadius || '',
                canSubmitProgressNoPlan: configuration.canSubmitProgressNoPlan || false,
                progressSubmitNoPlanGapTime: configuration.progressSubmitNoPlanGapTime || ''
            });
        } else {
            formik.resetForm();
        }
    }, [configuration]);

    return (
        <MainCard title="Business Details" >
            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3} alignItems={'flex-end'} width={'400px'}>
                    <Stack sx={{ gap: 1 }} width={'400px'}>
                        <InputLabel>Geo Restriction Radius (m)</InputLabel>
                        <TextField
                            id="geoRestrictionRadius"
                            name="geoRestrictionRadius"
                            type="number"
                            value={formik.values.geoRestrictionRadius}
                            onChange={formik.handleChange}
                            error={formik.touched.geoRestrictionRadius && Boolean(formik.errors.geoRestrictionRadius)}
                            helperText={formik.touched.geoRestrictionRadius && formik.errors.geoRestrictionRadius}
                            placeholder="Enter radius in meters"
                            fullWidth
                        />
                    </Stack>

                    {/* <Stack sx={{ gap: 1 }} width={'400px'}>
                        <InputLabel>Submission Gap (in hours)</InputLabel>
                        <TextField
                            id="progressSubmitNoPlanGapTime"
                            name="progressSubmitNoPlanGapTime"
                            type="number"
                            value={formik.values.progressSubmitNoPlanGapTime}
                            onChange={formik.handleChange}
                            error={formik.touched.progressSubmitNoPlanGapTime && Boolean(formik.errors.progressSubmitNoPlanGapTime)}
                            helperText={formik.touched.progressSubmitNoPlanGapTime && formik.errors.progressSubmitNoPlanGapTime}
                            placeholder="Enter gap in hours"
                            fullWidth
                        />
                    </Stack>

                    <Stack sx={{ gap: 1 }} width={'400px'}>
                        <FormControlLabel
                            control={
                                <Switch
                                    id="canSubmitProgressNoPlan"
                                    name="canSubmitProgressNoPlan"
                                    checked={formik.values.canSubmitProgressNoPlan}
                                    onChange={formik.handleChange}
                                />
                            }
                            label="Allow media submission without plan"
                        />
                    </Stack> */}



                    <Button type="submit" variant="contained" color="primary">
                        {'Save Configuration'}
                    </Button>
                </Stack>
            </form>
        </MainCard>
    );
}
