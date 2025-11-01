'use client';

import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MainCard from 'components/MainCard';
import { PieChart } from '@mui/x-charts';
// import TrendChart from 'components/charts/TrendChart';
import { getAnalyticsRequest } from 'store/dashboard/dashboardSlice';
import { useTheme } from '@mui/system';
import ConstructionTrendChart from './ConstructionTrendChart';

const AnalyticsSummary = () => {
    const theme = useTheme();

    const dispatch = useDispatch();
    const {
        loanTypeDistribution,
        propertyTypeDistribution,
        monthlyConstructionTrend
    } = useSelector((state) => state.dashboard.analytics);

    useEffect(() => {
        dispatch(getAnalyticsRequest());
    }, [dispatch]);

    return (
        <Grid container spacing={2} mt={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
                <MainCard title="Loan Count by Loan Type">
                    {loanTypeDistribution ? (
                        <PieChart
                            height={247}
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                            series={[
                                {
                                    data: loanTypeDistribution.map((item) => ({
                                        ...item,
                                        label: `${item.label ? item.label : 'N/A'} - ${item.value}`
                                    })),
                                    innerRadius: 60,
                                    outerRadius: 100,
                                    type: 'pie',
                                    highlightScope: { highlighted: 'item' },
                                    valueFormatter: (value) => `${value.value}%`
                                }
                            ]}
                            slotProps={{ legend: { hidden: true } }}
                        />
                    ) : (
                        <Typography>No data available</Typography>
                    )}
                </MainCard>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <MainCard title="Property Count by Property Type">
                    {propertyTypeDistribution ? (
                        <PieChart
                            height={247}
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                            series={[
                                {
                                    data: propertyTypeDistribution.map((item) => ({
                                        ...item,
                                        label: `${item.label ? item.label : 'N/A'} - ${item.value}`
                                    })),
                                    innerRadius: 60,
                                    outerRadius: 100,
                                    type: 'pie',
                                    highlightScope: { highlighted: 'item' },
                                    valueFormatter: (value) => `${value.value}%`
                                }
                            ]}
                            slotProps={{ legend: { hidden: true } }}
                        />
                    ) : (
                        <Typography>No data available</Typography>
                    )}
                </MainCard>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <ConstructionTrendChart />
            </Grid>
        </Grid>
    );
};

AnalyticsSummary.propTypes = {};

export default AnalyticsSummary;