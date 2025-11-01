'use client';

import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import * as yup from 'yup';

// material-ui
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';

const validationSchema = yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: yup.string().min(6, 'Password should be at least 6 characters').optional('Password is required'),
    roleId: yup.string().required('Role is required')
});

export default function UserBasicDetails({ userData, setUserData, handleNext, setErrorIndex, roles = [] }) {
    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            roleId: ''
        },
        validationSchema,
        onSubmit: (values) => {
            setUserData({ ...userData, ...values });
            handleNext();
        },
        enableReinitialize: true
    });

    useEffect(() => {
        if (userData) {
            formik.setValues({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                password: '',
                roleId: userData.roleId || ''
            });
        } else {
            formik.resetForm();
        }
    }, [userData]);

    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                User Basic Details
            </Typography>
            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3} >
                    <Stack spacing={3} direction={'row'}>
                        <Stack spacing={3} flex={1}>
                            <Stack sx={{ gap: 1 }}>
                                <InputLabel>First Name</InputLabel>
                                <TextField
                                    id="firstName"
                                    name="firstName"
                                    value={formik.values.firstName}
                                    onChange={formik.handleChange}
                                    error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                                    helperText={formik.touched.firstName && formik.errors.firstName}
                                    placeholder="Enter first name"
                                    fullWidth
                                />
                            </Stack>

                            <Stack sx={{ gap: 1 }}>
                                <InputLabel>Email</InputLabel>
                                <TextField
                                    id="email"
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                    placeholder="Enter email address"
                                    fullWidth
                                />
                            </Stack>

                            <Stack sx={{ gap: 1 }}>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    id="roleId"
                                    name="roleId"
                                    value={formik.values.roleId}
                                    onChange={formik.handleChange}
                                    error={formik.touched.roleId && Boolean(formik.errors.roleId)}
                                    fullWidth
                                    displayEmpty
                                >
                                    <MenuItem value="" disabled>Select role</MenuItem>
                                    {roles.map((role) => (
                                        <MenuItem key={role.id} value={role.id}>
                                            {role.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.roleId && formik.errors.roleId && (
                                    <FormHelperText error>{formik.errors.roleId}</FormHelperText>
                                )}
                            </Stack>
                        </Stack>
                        <Stack spacing={3} flex={1}>
                            <Stack sx={{ gap: 1 }}>
                                <InputLabel>Last Name</InputLabel>
                                <TextField
                                    id="lastName"
                                    name="lastName"
                                    value={formik.values.lastName}
                                    onChange={formik.handleChange}
                                    error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                    helperText={formik.touched.lastName && formik.errors.lastName}
                                    placeholder="Enter last name"
                                    fullWidth
                                />
                            </Stack>
                            <Stack sx={{ gap: 1 }}>
                                <InputLabel>Password</InputLabel>
                                <TextField
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    error={formik.touched.password && Boolean(formik.errors.password)}
                                    helperText={formik.touched.password && formik.errors.password}
                                    placeholder="Enter password"
                                    fullWidth
                                />
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

UserBasicDetails.propTypes = {
    userData: PropTypes.object,
    setUserData: PropTypes.func,
    handleNext: PropTypes.func,
    setErrorIndex: PropTypes.func,
    roles: PropTypes.array
};