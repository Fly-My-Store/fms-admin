'use client';

import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';

import { getDashboardMetricsRequest } from 'store/dashboard/dashboardSlice';
import CountAnalytics from 'components/cards/CountAnalytics';
import MainCard from 'components/MainCard';

const Matrics = () => {
    const dispatch = useDispatch();
    const { totalBusinesses, totalUsers, activeUsers, activeActivityTypes } = useSelector(
        (state) => state.dashboard.metrics
    );

    useEffect(() => {
        dispatch(getDashboardMetricsRequest());
    }, [dispatch]);

    return (
        <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CountAnalytics title="Total Businesses" count={String(totalBusinesses || 0)} color="primary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CountAnalytics title="Total Users" count={String(totalUsers || 0)} color="success" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CountAnalytics title="Active Users" count={String(activeUsers || 0)} color="warning" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CountAnalytics title="Active Activity Types" count={String(activeActivityTypes || 0)} color="error" />
            </Grid>
        </Grid>
    );
};

Matrics.propTypes = {};

export default Matrics;