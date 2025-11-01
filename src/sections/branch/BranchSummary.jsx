import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    InputLabel,
    IconButton,
    FormHelperText,
    MenuItem,
    Select,
    Autocomplete,
    Typography,
} from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';
import Grid from '@mui/material/Grid2';
import { fetchBranchSummaryRequest } from 'store/location/locationSlice';
import MainCard from 'components/MainCard';
import CountAnalytics from 'components/cards/CountAnalytics';


const BranchSummary = ({ filters }) => {
    const dispatch = useDispatch();
    const { branchSummary } = useSelector((state) => state.location);


    useEffect(() => {
        dispatch(fetchBranchSummaryRequest(filters));
    }, [dispatch, filters]);
    return <>
        <Grid container columnSpacing={2.75} mb={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                <CountAnalytics
                    title="Active Branches"
                    count={branchSummary.activeBranches || 0}
                    color="success"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                <CountAnalytics
                    title="Zone Branches"
                    count={branchSummary.zonesWithBranch || 0}
                    color="primary"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                <CountAnalytics
                    title="District Branches"
                    count={branchSummary.districtsWithBranch || 0}
                    color="error"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                <CountAnalytics
                    title="State Branches"
                    count={branchSummary.statesWithBranch || 0}
                    color="primary"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                <CountAnalytics
                    title="City Branches"
                    count={branchSummary.citiesWithBranch || 0}
                    color="error"
                />
            </Grid>
        </Grid>
    </>
};

export default BranchSummary;