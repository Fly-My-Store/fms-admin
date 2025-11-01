'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// material-ui
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

// project imports
import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';
import BasicDetails from './BasicDetails';
import BranchAccess from './BranchAccess';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import { createBusinessUserRequest, fetchUserByIdRequest, updateBusinessUserRequest } from 'store/user/userSlice';
import { fetchRolesRequest } from 'store/rolePermission/rolePermissionSlice';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

const steps = ['Basic Details', 'Branch Access'];

function getStepContent(step, props) {
    const stepProps = { ...props, stepIndex: step };

    switch (step) {
        case 0:
            return <BasicDetails {...stepProps} />;
        case 1:
            return <BranchAccess {...stepProps} />;
        default:
            throw new Error('Unknown step');
    }
}

export default function BusinessUserUpdateWizard() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const router = useRouter();


    const [activeStep, setActiveStep] = useState(0);
    const [errorIndex, setErrorIndex] = useState(null);
    const [userData, setUserData] = useState({});
    const [access, setAccess] = useState([]);


    const { user } = useSelector((state) => state.user);
    const { roles, loading } = useSelector((state) => state.rolePermission);

    useEffect(() => {
        dispatch(fetchRolesRequest());
    }, [dispatch]);

    useEffect(() => {
        if (id) {
            dispatch(fetchUserByIdRequest({ id, data: { returnAccess: true } }));
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (user && user.id) {
            const branchAccess = user.branchAccess
            setUserData(user);
            setAccess(branchAccess);
        }
    }, [user]);

    const handleNext = () => {
        setActiveStep(activeStep + 1);
        setErrorIndex(null);
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    const handleSubmit = (accessData) => {
        const { id, ...rest } = userData;
        const payload = {
            ...rest,
            access: accessData
        };
        console.log('payload', payload);
        if (userData.id) {
            dispatch(updateBusinessUserRequest({ id: userData.id, data: payload }));
        } else {
            dispatch(createBusinessUserRequest(payload));
        }
        router.push(`/members`);
    };


    const breadcrumbLinks = [
        { title: 'home', to: APP_DEFAULT_PATH },
        { title: 'users', to: '/members' },
        { title: 'user-wizard' }
    ];

    return (
        <>
            <Breadcrumbs custom heading={'user-wizard'} links={breadcrumbLinks} />
            <MainCard title={id ? 'Edit User' : 'Create User'}>
                <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
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

                {(
                    getStepContent(activeStep, {
                        branchAccessDisabled: userData.subtype === 'admin',
                        userData,
                        setUserData,
                        roles,
                        accessData: access,
                        setAccessData: setAccess,
                        handleNext,
                        handleBack,
                        handleSubmit,
                        setErrorIndex
                    })
                )}
            </MainCard>
        </>
    );
}
