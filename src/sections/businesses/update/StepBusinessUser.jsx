'use client';

import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import * as yup from 'yup';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import AnimateButton from 'components/@extended/AnimateButton';

const validationSchema = yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    phone: yup
        .string()
        .matches(/^\d{10}$/, 'Phone number must be 10 digits')
        .required('Phone number is required'),
    email: yup.string().email('Invalid email').required('User email is required'),
    password: yup.string().optional().min(8, 'Password must be at least 6 characters'),
    role: yup.string().optional()
});

export default function StepBusinessUser({ userFormData: formData, handleSubmit, handleBack, setErrorIndex }) {
    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            password: '',
            role: 'Super Admin'
        },
        validationSchema,
        onSubmit: (values) => {
            handleSubmit(values);
        },
        enableReinitialize: true
    });

    useEffect(() => {
        if (formData) {
            formik.setValues({
                firstName: formData?.firstName || '',
                lastName: formData?.lastName || '',
                phone: formData?.phone || '',
                email: formData?.email || '',
                password: '',
                role: 'Super Admin'
            });
        } else {
            formik.resetForm();
        }
    }, [formData]);

    const renderTextField = (label, name, type = 'text', placeholder = null, disabled) => (
        <Stack spacing={1} flex={1}>
            <InputLabel>{label}</InputLabel>
            <TextField
                id={name}
                name={name}
                type={type}
                value={formik.values[name]}
                onChange={formik.handleChange}
                error={formik.touched[name] && Boolean(formik.errors[name])}
                helperText={formik.touched[name] && formik.errors[name]}
                placeholder={placeholder || `Enter ${label}`}
                fullWidth
                disabled={disabled}
            />
        </Stack>
    );

    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Business User Details
            </Typography>
            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                    <Stack direction="row" spacing={3}>
                        {renderTextField('First Name', 'firstName')}
                        {renderTextField('Last Name', 'lastName')}
                    </Stack>
                    <Stack direction="row" spacing={3}>
                        {renderTextField('Phone Number', 'phone', 'number')}
                        {renderTextField('Role', 'role', 'text', null, true)}
                    </Stack>

                    <Stack direction="row" spacing={3}>
                        {renderTextField('Email', 'email')}
                        {renderTextField('Password', 'password', 'password')}
                    </Stack>

                    <Stack direction="row" justifyContent='space-between' width={'100%'}>
                        <Button variant="outlined" onClick={handleBack}>
                            Back
                        </Button>
                        <Button variant="contained" type="submit" onClick={() => setErrorIndex(1)}>
                            Submit
                        </Button>
                    </Stack>
                </Stack>
            </form>
        </>
    );
}

StepBusinessUser.propTypes = {
    userFormData: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired,
    handleBack: PropTypes.func.isRequired,
    setErrorIndex: PropTypes.func.isRequired
};
