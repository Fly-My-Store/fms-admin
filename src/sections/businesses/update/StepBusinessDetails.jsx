'use client';

import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { useEffect, useRef, useState } from 'react';
import * as yup from 'yup';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import AnimateButton from 'components/@extended/AnimateButton';
import { CameraTwoTone } from '@ant-design/icons';

const validationSchema = yup.object({
    logo: yup.mixed().nullable(),
    name: yup.string().required('Business name is required'),
    legalName: yup.string().required('Legal name is required'),
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    pincode: yup.string().matches(/^\d{6}$/, 'Pincode must be 6 digits').required('Pincode is required'),
    phone: yup.string().matches(/^\d{10}$/, 'Phone number must be 10 digits').required('Phone number is required'),
    alternatePhone: yup.string().matches(/^\d{10}$/, 'Alternate phone must be 10 digits').nullable(),
    email: yup.string().email('Invalid email').required('Email is required'),
    website: yup.string().url('Invalid URL').nullable()
});

export default function StepBusinessDetail({ businessFormData: formData, handleNext, setErrorIndex, logoPreview, setLogoPreview }) {
    const fileInputRef = useRef();
    const formik = useFormik({
        initialValues: {
            logo: null,
            name: '',
            legalName: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            phone: '',
            alternatePhone: '',
            email: '',
            website: ''
        },
        validationSchema,
        onSubmit: (values) => {
            handleNext(values);
        },
        enableReinitialize: true
    });

    useEffect(() => {
        if (formData) {
            const {
                logo,
                name = '',
                legalName = '',
                address = '',
                city = '',
                state = '',
                pincode = '',
                phone = '',
                alternatePhone = '',
                email = '',
                website = ''
            } = formData;

            formik.setValues({
                logo: logo || null,
                name,
                legalName,
                address,
                city,
                state,
                pincode,
                phone,
                alternatePhone,
                email,
                website
            });

            if (typeof logo === 'string') {
                setLogoPreview(logo);
            }
        } else {
            formik.resetForm();
        }
    }, [formData]);

    const handleLogoUpload = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            formik.setFieldValue('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const renderTextField = (label, name, type = 'text', placeholder = null) => (
        <Stack spacing={1} flex={1} >
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
            />
        </Stack>
    );

    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Business Details
            </Typography>
            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                            src={logoPreview}
                            alt="Business Logo"
                            sx={{ width: 120, height: 120, border: '2px solid #ccc', borderRadius: 2 }}
                        />
                        <Box>
                            <InputLabel>Upload Logo</InputLabel>
                            <IconButton color="primary" component="span" onClick={() => fileInputRef.current.click()}>
                                <CameraTwoTone />
                            </IconButton>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleLogoUpload}
                                style={{ display: 'none' }}
                            />
                        </Box>
                    </Box>
                    <Stack direction="row" spacing={3}>
                        {renderTextField('Business Name', 'name')}
                        {renderTextField('Legal Name', 'legalName')}
                    </Stack>

                    <Stack direction="row" spacing={3}>
                        {renderTextField('Address', 'address')}
                        {renderTextField('City', 'city')}

                    </Stack>
                    <Stack direction="row" spacing={3}>
                        {renderTextField('State', 'state')}
                        {renderTextField('Pincode', 'pincode')}

                    </Stack>
                    <Stack direction="row" spacing={3}>

                        {renderTextField('Phone Number', 'phone', 'number')}
                        {renderTextField('Alternate Phone Number', 'alternatePhone', 'number')}
                    </Stack>
                    <Stack direction="row" spacing={3}>

                        {renderTextField('Email', 'email')}
                        {renderTextField('Website', 'website')}
                    </Stack>


                    <Stack direction="row" justifyContent="flex-end" width="100%">
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

StepBusinessDetail.propTypes = {
    BusinessFormData: PropTypes.object,
    handleNext: PropTypes.func.isRequired,
    setErrorIndex: PropTypes.func.isRequired,
    logoPreview: PropTypes.string,
    setLogoPreview: PropTypes.func
};