'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Grid from '@mui/material/Grid2';
import CountAnalytics from 'components/cards/CountAnalytics';
import { getLoanSummaryRequest } from 'store/dashboard/dashboardSlice';

const LoanSummary = () => {
    const dispatch = useDispatch();
    const {
        loanCount = 0,
        totalSanctionedAmount = 0,
        totalDisbursedAmount = 0,
        openDisbursementRequestCount = 0
    } = useSelector(
        (state) => state.dashboard.loanSummary
    );

    useEffect(() => {
        dispatch(getLoanSummaryRequest());
    }, [dispatch]);

    return (
        <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CountAnalytics
                    title="Loan Count"
                    count={loanCount || 0}
                    color="primary"
                    footerText="Total loans issued till date"
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CountAnalytics
                    title="Sanctioned Amount"
                    count={(totalSanctionedAmount / 10000000).toFixed(2)}
                    color="success"
                    unit="cr"
                    footerText="Sanctioned loan amount in crore"
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CountAnalytics
                    title="Disbursed Amount"
                    count={(totalDisbursedAmount / 10000000).toFixed(2)}
                    color="warning"
                    unit="cr"
                    footerText="Disbursed amount across all loans"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CountAnalytics
                    title="Open Disbursement Requests"
                    count={openDisbursementRequestCount || 0}
                    color="error"
                    footerText="Pending requests awaiting approval"
                />
            </Grid>
        </Grid>
    );
};

export default LoanSummary;