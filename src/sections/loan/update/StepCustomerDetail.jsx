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
import { useSelector } from 'react-redux';

const validationSchema = yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').optional('Email is required'),
    mobile: yup
        .string()
        .matches(/^\d{10}$/, 'Mobile number must be 10 digits')
        .required('Mobile number is required')
});

export default function StepCustomerDetail({
    loanFormData,
    handleCustomerDetail,
    setErrorIndex
}) {

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            mobile: ''
        },
        validationSchema,
        onSubmit: (values) => {
            handleCustomerDetail(values);
        },
        enableReinitialize: true
    });

    useEffect(() => {
        if (loanFormData) {
            formik.setValues({
                firstName: loanFormData?.firstName || '',
                lastName: loanFormData?.lastName || '',
                email: loanFormData?.email || '',
                mobile: loanFormData?.mobile || ''
            });
        } else {
            formik.resetForm();
        }
    }, [loanFormData]);

    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Customer Details
            </Typography>
            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                    <Stack direction="row" spacing={3}>
                        <Stack flex={1} spacing={1}>
                            <InputLabel>First Name</InputLabel>
                            <TextField
                                id="firstName"
                                name="firstName"
                                value={formik.values.firstName}
                                onChange={formik.handleChange}
                                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                                placeholder="Enter First Name"
                                fullWidth
                            />
                        </Stack>

                        <Stack flex={1} spacing={1}>
                            <InputLabel>Last Name</InputLabel>
                            <TextField
                                id="lastName"
                                name="lastName"
                                value={formik.values.lastName}
                                onChange={formik.handleChange}
                                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                placeholder="Enter Last Name"
                                fullWidth
                            />
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={3}>
                        <Stack flex={1} spacing={1}>
                            <InputLabel>Email</InputLabel>
                            <TextField
                                id="email"
                                name="email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                placeholder="Enter Email"
                                fullWidth
                            />
                        </Stack>

                        <Stack flex={1} spacing={1}>
                            <InputLabel>Mobile</InputLabel>
                            <TextField
                                id="mobile"
                                name="mobile"
                                type="tel"
                                value={formik.values.mobile}
                                onChange={formik.handleChange}
                                error={formik.touched.mobile && Boolean(formik.errors.mobile)}
                                placeholder="Enter Mobile Number"
                                fullWidth
                            />
                        </Stack>
                    </Stack>

                    <Stack direction="row" justifyContent='flex-end' width={'100%'}>
                        <Button variant="contained" type="submit" onClick={() => setErrorIndex(0)}>
                            Next
                        </Button>
                    </Stack>
                </Stack>
            </form>
        </>
    );
}

StepCustomerDetail.propTypes = {
    handleCustomerDetail: PropTypes.func,
    setErrorIndex: PropTypes.func
};