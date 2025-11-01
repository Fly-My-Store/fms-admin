'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import MainCard from 'components/MainCard';
import StepBusinessDetails from './StepBusinessDetails';
import StepBusinessUser from './StepBusinessUser';

import { useParams } from 'next/navigation';

import { useRouter } from 'next/navigation';
import { fetchBusinessByIdRequest } from 'store/business/businessSlice';
import { APP_DEFAULT_PATH } from 'config';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { assembleBusinessPayload } from 'utils/assembleBusinessPayload';
import { createBusiness, updateBusiness } from 'api/business';
import { openSnackbar } from 'api/snackbar';

const steps = ['Business Details', 'Business Settings'];

function getStepContent(step, props) {
    switch (step) {
        case 0:
            return <StepBusinessDetails {...props} />;
        case 1:
            return <StepBusinessUser {...props} />;
        default:
            throw new Error('Unknown step');
    }
}

export default function BusinessWizard() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const router = useRouter();

    const [logoPreview, setLogoPreview] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    const [errorIndex, setErrorIndex] = useState(null);
    const [userFormData, setUserFormData] = useState();
    const [businessFormData, setBusinessFormData] = useState();

    const { business } = useSelector((state) => state.business);

    useEffect(() => {
        if (id) {
            dispatch(fetchBusinessByIdRequest(id));
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (business) {
            setBusinessFormData(business.businessData);
            setUserFormData(business.userData);
        }
    }, [business]);

    const handleNext = (values) => {
        console.log('handleNext', values);
        setBusinessFormData((prev) => ({
            ...prev,
            ...values
        }));
        setActiveStep((prev) => prev + 1);
        setErrorIndex(null);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = async (values) => {
        try {
            setErrorIndex(null);
            const data = assembleBusinessPayload(businessFormData, { ...userFormData, ...values });
            let response;
            if (businessFormData.id) {
                response = await updateBusiness(businessFormData.id, data);
                openSnackbar({
                    open: true,
                    message: 'Business updated successfully',
                    variant: 'alert',
                    alert: { color: 'success' }
                });
            } else {
                response = await createBusiness(data);
                openSnackbar({
                    open: true,
                    message: 'Business created successfully',
                    variant: 'alert',
                    alert: { color: 'success' }
                });
            }

            router.push(`/businesses`);
        } catch (error) {
            openSnackbar({
                open: true,
                message: error?.error?.errors[0]?.message || 'Something went wrong.',
                variant: 'alert',
                alert: { color: 'error' }
            });
        }
    };

    const breadcrumbLinks = [
        { title: 'home', to: APP_DEFAULT_PATH },
        { title: 'businesses', to: '/businesses' },
        { title: id ? 'update-business' : 'new-business' },
    ];

    return (
        <>
            <Breadcrumbs custom heading={id ? 'update-business' : 'new-business'} links={breadcrumbLinks} />
            <MainCard >
                <Stack alignItems={'center'}>
                    <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5, width: '50%' }}>
                        {steps.map((label, index) => {
                            const labelProps = {};
                            if (index === errorIndex) {
                                labelProps.optional = (
                                    <Typography variant="caption" color="error">
                                        Error
                                    </Typography>
                                );
                                labelProps.error = true;
                            }
                            return (
                                <Step key={label}>
                                    <StepLabel {...labelProps}>{label}</StepLabel>
                                </Step>
                            );
                        })}
                    </Stepper>
                </Stack>
                {(
                    getStepContent(activeStep, {
                        userFormData,
                        businessFormData,
                        handleBack,
                        handleSubmit,
                        handleNext,
                        setErrorIndex,
                        logoPreview,
                        setLogoPreview
                    })
                )}
            </MainCard>
        </>
    );
}