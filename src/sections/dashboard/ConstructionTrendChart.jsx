'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { LineChart, ChartsXAxis, ChartsYAxis, LinePlot, MarkPlot, BarPlot, ChartsGrid, ChartsTooltip } from '@mui/x-charts';
import MainCard from 'components/MainCard';
import { getConstructionTrendRequest } from 'store/dashboard/dashboardSlice'; // Assume this action exists
import dayjs from 'dayjs';
import { useTheme } from '@mui/system';

export default function ConstructionTrendChart() {
    const theme = useTheme();
    const dispatch = useDispatch();
    const { monthlyConstructionTrend = [] } = useSelector((state) => state.dashboard.analytics);
    const start = dayjs().subtract(29, 'day');
    const end = dayjs();
    const trendMap = new Map(monthlyConstructionTrend.map(item => [dayjs(item.date).format('YYYY-MM-DD'), Number(item.count)]));

    const formatted = Array.from({ length: 30 }, (_, i) => {
        const date = start.add(i, 'day');
        const key = date.format('YYYY-MM-DD');
        const count = trendMap.get(key) || 0;
        return {
            day: date.format('DD/MM'),
            bar: count,
            line: count
        };
    });
    const series = [
        { type: 'bar', id: 'teamA', dataKey: 'bar', color: theme.palette.warning.main, label: 'Construction Plan' },
        { type: 'line', id: 'teamB', dataKey: 'line', color: theme.palette.warning.main }
    ];

    const axisFonstyle = { fontSize: 10, fill: theme.palette.text.secondary };

    return (
        <MainCard title="Construction Progress Trend (Last 30 Days)">
            <Box sx={{ width: '100%' }}>
                <LineChart
                    dataset={formatted}
                    series={series}
                    height={280}
                    xAxis={[
                        {
                            scaleType: 'band',
                            dataKey: 'day',
                            disableLine: true,
                            tickPlacement: 'middle',
                            tickLabelStyle: { ...axisFonstyle, fontSize: 12 }
                        }
                    ]}
                    yAxis={[{ id: 'leftAxis', min: 0, disableLine: true, disableTicks: true, tickLabelStyle: axisFonstyle, tickMaxStep: 10 }]}
                    slotProps={{ legend: { hidden: true } }}
                    margin={{ right: 20, left: 30, bottom: 20 }}
                    sx={(theme) => ({
                        '& .MuiBarElement-series-teamA': { fill: "url('#barGradient')" },
                        '& .MuiChartsAxis-directionX .MuiChartsAxis-tick': { stroke: theme.palette.divider }
                    })}
                >
                    <ChartsGrid horizontal />
                    <BarPlot />
                    <LinePlot />
                    <MarkPlot />
                    <ChartsYAxis />
                    <ChartsTooltip />
                </LineChart>
                <svg width="0" height="0">
                    <defs>
                        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={theme.palette.background.default} stopOpacity={0.1} />
                            <stop offset="100%" stopColor={theme.palette.warning.main} stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                </svg>
            </Box>
        </MainCard>
    );
}