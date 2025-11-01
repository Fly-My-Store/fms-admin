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
import AnimateButton from 'components/@extended/AnimateButton';
import ConstructionPlanConfigStep from './ConstructionPlanConfigStep';
import ActivityTableStep from './ConstructionPlanActivityConfigStep';
import { enqueueSnackbar } from 'notistack';

import { useParams } from 'next/navigation';

import {
    createPlanConfigRequest,
    updatePlanConfigRequest,
    fetchPlanConfigByIdRequest
} from 'store/constructionPlanConfig/constructionPlanConfigSlice';

import {
    fetchStructureTypesRequest,
    fetchLoanTypesRequest
} from 'store/loan/loanSlice';

import {
    fetchPlanActivityConfigsRequest
} from 'store/constructionPlanActivityConfig/constructionPlanActivityConfigSlice';
import { fetchActivitiesRequest } from 'store/constructionActivity/constructionActivitySlice';
import ActivityForm from './ConstructionPlanActivityConfigForm';
import { useRouter } from 'next/navigation';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';

const steps = ['Details', 'Activity Configurations'];

function getStepContent(step, props) {
    switch (step) {
        case 0:
            return <ConstructionPlanConfigStep {...props} />;
        case 1:
            return <ActivityTableStep {...props} />;
        default:
            throw new Error('Unknown step');
    }
}

export default function ConstructionPlanConfigFormWizard() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const router = useRouter();

    const { planConfig } = useSelector((state) => state.constructionPlanConfig);
    const { planActivityConfigs } = useSelector((state) => state.constructionPlanActivityConfig);
    const [activeStep, setActiveStep] = useState(0);
    const [errorIndex, setErrorIndex] = useState(null);
    const [configData, setConfigData] = useState({});
    const [configActivities, setConfigActivities] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    const handleDialogToggle = () => {
        setOpen((prev) => !prev);
        if (open) setSelectedActivity(null);
    };

    const handleAddButton = () => {
        setSelectedActivity(null);
        setOpen(true);
    };

    const handleEditButton = (row) => {
        setSelectedActivity(row);
        setOpen(true);
    };

    useEffect(() => {
        if (id) {
            dispatch(fetchPlanConfigByIdRequest(id));
            dispatch(fetchPlanActivityConfigsRequest({ constructionPlanConfigId: id }));
        }
    }, [id, dispatch]);

    useEffect(() => {
        dispatch(fetchActivitiesRequest({ active: true }));
    }, [dispatch]);

    useEffect(() => {
        if (planConfig?.id) {
            setConfigData({
                id: planConfig.id,
                name: planConfig.name,
                description: planConfig.description,
                loanTypeId: planConfig.loanTypeId,
                structureTypeId: planConfig.structureTypeId,
                floors: planConfig.floors,
                basement: planConfig.basement,
                residentialFloors: planConfig.residentialFloors,
                status: planConfig.status,
            });
        }
    }, [planConfig]);

    useEffect(() => {
        setConfigActivities(planActivityConfigs);
    }, [planActivityConfigs]);

    const handleNext = (values) => {
        const config = { ...configData, ...values, residentialFloors: values.parking === 1 ? values.floors - 1 : values.floors }
        if (configData?.id) {
            dispatch(updatePlanConfigRequest({ id: config.id, data: config }));
        } else {
            dispatch(createPlanConfigRequest(config));
        }
        setConfigData(config);
        setActiveStep((prev) => prev + 1);
        setErrorIndex(null);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSubmit = () => {
        const totalWeightage = configActivities.reduce(
            (sum, item) => sum + Number(item.weightage || 0),
            0
        );

        if (totalWeightage !== 100) {
            enqueueSnackbar('Total Weightage should be exactly 100%', { variant: 'error' });
            return;
        }
        dispatch(updatePlanConfigRequest({ id: configData.id, data: { progress: 2 } }));
        router.push('/construction-plan-config');
    };

    const breadcrumbLinks = [
        { title: 'home', to: APP_DEFAULT_PATH },
        { title: 'construction-plan-configs', to: '/construction-plan-config' },
        { title: 'construction-plan-config' },
    ];

    return (
        <>
            <Breadcrumbs custom heading={id ? 'update-construction-plan-config' : 'new-construction-plan-config'} links={breadcrumbLinks} />
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
                        configData,
                        setConfigData,
                        configActivities,
                        setConfigActivities,
                        handleNext,
                        handleBack,
                        handleSubmit,
                        setErrorIndex,
                        handleAddButton,
                        handleEditButton
                    })
                )}
                <ActivityForm open={open} onClose={handleDialogToggle} initialData={selectedActivity} planConfigId={configData.id} />
            </MainCard>
        </>
    );
}