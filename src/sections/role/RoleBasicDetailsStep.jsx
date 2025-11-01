'use client';

import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import * as yup from 'yup';

// material-ui
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';

const validationSchema = yup.object({
    name: yup.string().required('Role name is required'),
    description: yup.string().required('Description is required')
});

export default function RoleBasicDetailsStep({ roleData, setRoleData, handleNext, setErrorIndex }) {
    const formik = useFormik({
        initialValues: {
            name: '',
            description: ''
        },
        validationSchema,
        onSubmit: (values) => {
            setRoleData({ ...roleData, ...values });
            handleNext();
        },
        enableReinitialize: true
    });

    useEffect(() => {
        if (roleData) {
            formik.setValues({
                name: roleData.name || '',
                description: roleData.description || ''
            });
        } else {
            formik.resetForm();
        }
    }, [roleData]);

    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Basic Details
            </Typography>
            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3} minWidth={'400px'}
                    sx={{
                        height: '300px', 
                    }}>
                    <Stack sx={{ gap: 1 }}>
                        <InputLabel>Role Name</InputLabel>
                        <TextField
                            id="name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            placeholder="Enter role name"
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
                            placeholder="Enter role description"
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Stack>

                   
                </Stack>
                 <Stack direction="row" justifyContent="flex-end">
                        <AnimateButton>
                            <Button variant="contained" sx={{ ml: 1 }} type="submit" onClick={() => setErrorIndex(0)}>
                                Next
                            </Button>
                        </AnimateButton>
                    </Stack>
            </form>
        </>
    );
}

RoleBasicDetailsStep.propTypes = {
    roleData: PropTypes.object,
    setRoleData: PropTypes.func,
    handleNext: PropTypes.func,
    setErrorIndex: PropTypes.func
};
