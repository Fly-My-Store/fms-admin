'use client';

import PropTypes from 'prop-types';
import { useEffect, useState, useMemo, use, useCallback } from 'react';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

import BasicReactTable from 'components/tables/basicTable';
import AnimateButton from 'components/@extended/AnimateButton';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchConstructionPlansRequest,
    fetchLoanByIdRequest,
    generateConstructionPlanRequest
} from 'store/loan/loanSlice';
import { fetchPlanConfigsRequest } from 'store/constructionPlanConfig/constructionPlanConfigSlice';
import { fetchPlanActivityConfigsRequest } from 'store/constructionPlanActivityConfig/constructionPlanActivityConfigSlice';
import { Alert, Box, Chip, IconButton, Tooltip } from '@mui/material';
import { DownOutlined, RightOutlined, StopOutlined } from '@ant-design/icons';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import ConstructionPlanTable from 'components/tables/constructionPlanTable';
import { set } from 'store';
import { enqueueSnackbar } from 'notistack';
import ActivityStatusChart from './ActivityStatusChart';
import ConstructionPlanDetails from './ConstructionPlanDetails';
import ConfirmationDialog from 'components/ConfirmationDialog';
import { RESET_CONSTRUCTION_PLAN } from 'utils/constants';

export default function ConstructionPlan({ loan, property }) {
    if (!property.id) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                }}
            >
                <Alert severity="info">Property details are required to view the construction plan.</Alert>
            </Box>
        );
    }

    const dispatch = useDispatch();

    const [showConfig, setShowConfig] = useState(false);
    const { planConfigs } = useSelector((state) => state.constructionPlanConfig);
    const { constructionPlans } = useSelector((state) => state.loan);

    const { planActivityConfigs } = useSelector((state) => state.constructionPlanActivityConfig);
    const [selectedConfigId, setSelectedConfigId] = useState('');
    const [open, setOpen] = useState(false);

    const fetchConstructionPlans = useCallback((fetchLoan) => {
        dispatch(fetchConstructionPlansRequest({ loanId: loan.id }));
        if (fetchLoan) {
            dispatch(fetchLoanByIdRequest(loan.id));
        }
    }, [loan]);

    useEffect(() => {
        fetchConstructionPlans(false);
        dispatch(fetchPlanConfigsRequest({
            floors: property.floors || 0,
            basement: property.basements || 0,
            residentialFloors: property.residentialFloors || 0,
            loanTypeId: loan.loanTypeId,
            structureTypeId: property.structureTypeId
        }));
    }, [loan, property, dispatch]);

    useEffect(() => {
        if (planConfigs.length === 1) {
            onSelectConstructionPlanConfig(planConfigs[0].id);
        }
    }, [planConfigs])

    useEffect(() => {
        setShowConfig(false);
    }, [constructionPlans]);

    const handleGeneratePlan = () => {
        if ((constructionPlans?.length === 0 || showConfig) && property.id) {
            if (selectedConfigId && planConfigs.length > 0) {
                dispatch(generateConstructionPlanRequest({ propertyId: property.id, constructionPlanConfigId: selectedConfigId }));
                enqueueSnackbar('Construction Plan Generated Succesfully!', { variant: 'success' });
                setSelectedConfigId('');
            } else {
                enqueueSnackbar('Please Select Construction Plan Configuration!', { variant: 'error' });
            }
        } else {
            setSelectedConfigId('');
        }
    };

    const handleChangePlan = () => {
        setShowConfig(true);
        setOpen(false)
    };

    const resetShowConfig = () => {
        setShowConfig(false);
        setSelectedConfigId('');
    };

    const onSelectConstructionPlanConfig = (id) => {
        setSelectedConfigId(id)
        dispatch(fetchPlanActivityConfigsRequest({ constructionPlanConfigId: id }));
    }

    const configColumns = useMemo(
        () => [
            { header: 'Activity Name', accessorKey: 'constructionActivity.name' },
            { header: 'Weightage', accessorKey: 'weightage' },
            { header: '# Photos', accessorKey: 'imageCount' },
            { header: '# Videos', accessorKey: 'videoCount' }
        ],
        []
    );

    const [selectedPlan, setSelectedPlan] = useState();

    const handleDrawerClose = () => {
        setSelectedPlan();
    };

    const onRowClick = (data) => {
        setSelectedPlan(data);
    };

    const topActions = () => (
        <Select
            value={selectedConfigId}
            onChange={(e) => onSelectConstructionPlanConfig(e.target.value)}
            displayEmpty
            sx={{
                minWidth: 300,
                bgcolor: 'background.paper',
                borderColor: selectedConfigId ? 'success.main' : 'warning.main',
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: selectedConfigId ? 'success.main' : 'warning.main'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.dark',
                    borderWidth: 2
                }
            }}
        >
            <MenuItem value="" disabled>Select Configuration Plan</MenuItem>
            {planConfigs.map((config) => (
                <MenuItem key={config.id} value={config.id}>{config.name}</MenuItem>
            ))}
        </Select>
    )
    const subheader = () => (
        <>
            {planConfigs?.length > 1 &&
                <Typography>Select a plan to view Construction plan configuration details.</Typography>
            }
        </>
    );
    const innerContainer = () => (
        <>
            {planConfigs?.length === 0 &&
                <Alert sx={{ mb: 2 }} severity="warning">No Construction Plan configuration found for this property type. Please Contact Admin.</Alert>
            }
        </>
    );


    return (
        <>
            {(constructionPlans?.length === 0 || showConfig) ? (
                <BasicReactTable
                    columns={configColumns}
                    data={selectedConfigId && planConfigs.length > 0 ? planActivityConfigs : []}
                    title="Applicable Construction Plan for this Property."
                    showPagination={false}
                    topActions={topActions}
                    subheader={subheader}
                    innerContainer={innerContainer}
                />
            ) : (
                <ConstructionPlanTable {...{
                    onResetPlanClick: () => setOpen(true),
                    title: constructionPlans?.length > 0 ? constructionPlans[0].planName : '',
                    data: constructionPlans,
                    onRowClick,
                    selectedPlan
                }} />
            )}

            {(constructionPlans.length === 0 || showConfig) &&
                <Stack direction="row" justifyContent="space-around" width="100%" mt={3}>
                    <Button variant="outlined" color="error" onClick={resetShowConfig}>
                        Cancel
                    </Button>

                    <AnimateButton>
                        <Button variant="contained" color="primary" onClick={handleGeneratePlan}>
                            Submit
                        </Button>
                    </AnimateButton>
                </Stack>}
            <ConstructionPlanDetails open={selectedPlan?.id ? true : false} selectedPlan={selectedPlan} handleDrawerClose={handleDrawerClose} fetchConstructionPlans={fetchConstructionPlans} />
            <ConfirmationDialog
                open={open}
                title={RESET_CONSTRUCTION_PLAN.title}
                description={RESET_CONSTRUCTION_PLAN.message}
                onConfirm={handleChangePlan}
                onCancel={() => setOpen(false)}
            />
        </>
    );
}

ConstructionPlan.propTypes = {
    loanId: PropTypes.string.isRequired,
    property: PropTypes.object.isRequired
};