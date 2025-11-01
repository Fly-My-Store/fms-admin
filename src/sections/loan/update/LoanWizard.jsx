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
import StepCustomerDetail from './StepCustomerDetail';
import StepDisbursement from './StepDisbursement';
import StepConstructionPlan from './StepConstructionPlan';
import StepLoanDetails from './StepLoanDetails';
import StepPropertyDetail from './StepPropertyDetail';
import DisbursalForm from './DisbursalForm';

import { useParams } from 'next/navigation';

import { useRouter } from 'next/navigation';
import { addPropertyRequest, createLoanRequest, fetchLoanByIdRequest, updateLoanRequest, updatePropertyRequest } from 'store/loan/loanSlice';
import { property } from 'lodash-es';
import { APP_DEFAULT_PATH } from 'config';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { openSnackbar } from 'api/snackbar';

const steps = ['Customer Details', 'Loan Details', 'Property Details', 'Disbursement', 'Construction Plan'];

function getStepContent(step, props) {
    switch (step) {
        case 0:
            return <StepCustomerDetail {...props} />;
        case 1:
            return <StepLoanDetails {...props} />;
        case 2:
            return <StepPropertyDetail {...props} />;
        case 3:
            return <StepDisbursement {...props} />;
        case 4:
            return <StepConstructionPlan {...props} />;
        default:
            throw new Error('Unknown step');
    }
}

export default function LoanWizard() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const router = useRouter();

    const [activeStep, setActiveStep] = useState(0);
    const [errorIndex, setErrorIndex] = useState(null);
    const [loanFormData, setLoanFormData] = useState({});
    const [propertyFormData, setPropertyFormData] = useState({});

    const [disbursals, setDisbursals] = useState();
    const [open, setOpen] = useState(false);
    const [selectedDisbursal, setSelectedDisbursal] = useState();

    const { loan } = useSelector((state) => state.loan);

    const handleDialogToggle = () => {
        setOpen((prev) => !prev);
        if (open) setSelectedDisbursal(null);
    };

    const handleAddButton = () => {
        setSelectedDisbursal(null);
        setOpen(true);
    };

    const handleEditButton = (row) => {
        setSelectedDisbursal(row);
        setOpen(true);
    };

    useEffect(() => {
        if (id) {
            dispatch(fetchLoanByIdRequest(id));
        }
    }, [id, dispatch]);

    useEffect(() => {
        if (loan) {
            const { property, loanDisbursals, ...rest } = loan;
            setLoanFormData(rest);
            setPropertyFormData(prev => ({
                ...property,
                city: prev?.city || property?.city,
                state: prev?.state || property?.state,
                district: prev?.district || property?.district,
            }));
            setDisbursals(loanDisbursals || []);
        }
    }, [loan]);

    const handleCustomerDetail = (values) => {
        setLoanFormData((prev) => ({
            ...prev,
            ...values
        }));
        handleNext();
    }

    const handleLoanDetail = (values) => {
        setErrorIndex(null);
        setPropertyFormData((prev) => ({
            ...prev,
            city: values?.city || prev?.city,
            state: values?.state || prev?.state,
            district: values?.district || prev?.district,
        }));

        setLoanFormData((prev) => ({
            ...prev,
            ...values
        }));
        const { firstName, lastName, email, mobile } = loanFormData;
        const data = {
            firstName, lastName, email, mobile,
            ...values
        };
        if (loanFormData.id) {
            dispatch(updateLoanRequest({
                id: loanFormData.id,
                data,
                callback: () => {
                    handleNext();
                },
                onError: (message) => {
                    openSnackbar({
                        open: true,
                        message: message,
                        variant: 'alert',
                        alert: { color: 'error' }
                    });
                }
            }));
        } else {
            dispatch(createLoanRequest({
                data,
                callback: () => {
                    handleNext();
                },
                onError: (message) => {
                    openSnackbar({
                        open: true,
                        message: message,
                        variant: 'alert',
                        alert: { color: 'error' }
                    });
                }
            }));
        }
    }

    const handlePropertyDetail = (values) => {
        const totalFloors = Number(values.floors || 0);
        const isGFNonResidential = values.isGroundFloorNonResidential;
        const residentialFloors = isGFNonResidential ? totalFloors - 1 : totalFloors;
        const finalValues = {
            ...values,
            residentialFloors
        };
        setPropertyFormData((prev) => ({
            ...prev,
            ...finalValues
        }));
        if (propertyFormData?.id) {
            dispatch(updatePropertyRequest({ id: propertyFormData.id, data: finalValues }));
        } else {
            dispatch(addPropertyRequest({ ...finalValues, loanId: loanFormData.id }));
        }
        handleNext();
    }

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
        setErrorIndex(null);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = () => {
        router.push(`/loan/${loanFormData.id}/detail`);
    };

    const breadcrumbLinks = [
        { title: 'home', to: APP_DEFAULT_PATH },
        { title: 'loan', to: '/loan' },
        { title: id ? 'update-loan' : 'new-loan' },
    ];

    return (
        <>
            <Breadcrumbs custom heading={id ? 'update-loan' : 'new-loan'} links={breadcrumbLinks} />
            <MainCard >
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
                        disbursals,
                        loanFormData,
                        propertyFormData,
                        handleCustomerDetail,
                        handleLoanDetail,
                        handlePropertyDetail,
                        handleBack,
                        handleSubmit,
                        handleNext,
                        setErrorIndex,
                        handleAddButton,
                        handleEditButton,
                        loan: loanFormData,
                        property: propertyFormData,
                    })
                )}
                <DisbursalForm
                    open={open}
                    onClose={handleDialogToggle}
                    initialData={selectedDisbursal}
                    loanId={loanFormData?.id}
                    firstDisbursement={disbursals?.length < 1}
                    sequence={(disbursals?.length || 0) + 1}
                />
            </MainCard>
        </>
    );
}