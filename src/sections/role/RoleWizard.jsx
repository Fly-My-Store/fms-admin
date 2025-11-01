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
import RoleBasicDetailsStep from './RoleBasicDetailsStep';
import RolePermissionMatrixStep from './RolePermissionMatrixStep';
import { useDispatch, useSelector } from 'react-redux';
import { createRoleRequest, updateRoleRequest, getRoleByIdRequest } from 'store/rolePermission/rolePermissionSlice';
import { IconButton } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';
import { width } from '@mui/system';

const steps = ['Basic Details', 'Role Permissions'];

function getStepContent(step, props) {
    switch (step) {
        case 0:
            return <RoleBasicDetailsStep {...props} />;
        case 1:
            return <RolePermissionMatrixStep {...props} />;
        default:
            throw new Error('Unknown step');
    }
}

export default function RoleWizard({ onClose, initialData = null }) {
    const dispatch = useDispatch();
    const { role } = useSelector((state) => state.rolePermission);

    const [activeStep, setActiveStep] = useState(0);
    const [errorIndex, setErrorIndex] = useState(null);
    const [roleData, setRoleData] = useState({});
    const [permissionMatrix, setPermissionMatrix] = useState({});

    useEffect(() => {
        if (initialData?.id) {
            dispatch(getRoleByIdRequest(initialData.id));
        }
    }, [initialData, dispatch]);

    useEffect(() => {
        if (initialData?.id && role?.id) {
            setRoleData({
                name: role.name || '',
                description: role.description || '',
                id: role.id
            });

            const matrix = {};
            role.rolePermissions?.forEach((rp) => {
                matrix[rp.permissionId] = {
                    create: rp.create || false,
                    read: rp.read || false,
                    modify: rp.modify || false,
                    delete: rp.delete || false
                };
            });
            setPermissionMatrix(matrix);
        }
    }, [role]);

    const handleNext = () => {
        setActiveStep(activeStep + 1);
        setErrorIndex(null);
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    const handleSubmit = () => {
        const payload = {
            ...roleData,
            permissionMatrix
        };

        if (roleData.id) {
            dispatch(updateRoleRequest({ id: roleData.id, data: payload }));
        } else {
            dispatch(createRoleRequest(payload));
        }
        onClose();
    };

    return (
        <MainCard
            title={roleData?.id ? 'Edit Role' : 'Create Role'}
            secondary={
                <IconButton color="primary" onClick={onClose} aria-label={'close'}>
                    <CloseOutlined />
                </IconButton>
            }
            sx={{  width: 500, height: 600 }}
        >
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

            {activeStep === steps.length ? (
                <>
                    <Typography variant="h5" gutterBottom>
                        Role {roleData?.id ? 'Updated' : 'Created'} Successfully
                    </Typography>
                    <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                        <AnimateButton>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    setRoleData({});
                                    setPermissionMatrix({});
                                    setActiveStep(0);
                                }}
                            >
                                {roleData?.id ? 'Edit Again' : 'Create Another'}
                            </Button>
                        </AnimateButton>
                    </Stack>
                </>
            ) : (
                getStepContent(activeStep, {
                    roleData,
                    setRoleData,
                    permissionMatrix,
                    setPermissionMatrix,
                    handleNext,
                    handleBack,
                    handleSubmit,
                    setErrorIndex
                })
            )}
        </MainCard>
    );
}

RoleWizard.propTypes = {
    onClose: PropTypes.func,
    initialData: PropTypes.object
};
