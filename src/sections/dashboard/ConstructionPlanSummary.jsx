'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Grid from '@mui/material/Grid2';
import CountAnalytics from 'components/cards/CountAnalytics';
import { getConstructionPlanSummaryRequest } from 'store/dashboard/dashboardSlice';

export default function ConstructionPlanSummary() {
    const dispatch = useDispatch();
    const {
        submittedCurrentMonth = 0,
        submittedLastMonth = 0,
        inSubmittedStateCount = 0
    } = useSelector((state) => state.dashboard.constructionPlanSummary);
    const {
        loanCount = 0,
        totalSanctionedAmount = 0,
        totalDisbursedAmount = 0,
        openDisbursementRequestCount = 0
    } = useSelector(
        (state) => state.dashboard.loanSummary);

    const loadingConstructionPlanSummary = useSelector((state) => state.dashboard.loadingConstructionPlanSummary);

    useEffect(() => {
        dispatch(getConstructionPlanSummaryRequest());
    }, [dispatch]);


    return (
        <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <CountAnalytics
                    title="Open Disbursement Requests"
                    count={openDisbursementRequestCount || 0}
                    color="error"
                    footerText="Pending requests awaiting approval"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <CountAnalytics
                    title="Construction Plans Submitted this month"
                    count={submittedCurrentMonth}
                    subCount={submittedLastMonth}
                    subLabel="Last Month"
                    color="primary"
                    loading={loadingConstructionPlanSummary}
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4  }}>
                <CountAnalytics
                    title="Construction Plans Submitted"
                    count={inSubmittedStateCount}
                    color="warning"
                    loading={loadingConstructionPlanSummary}
                    footerText="Construction plans currently in submitted state"
                />
            </Grid>
        </Grid>
    );
}