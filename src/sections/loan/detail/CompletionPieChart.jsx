'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Typography, Stack } from '@mui/material';

// COLORS
const COLORS = ['#4caf50', '#e0e0e0']; // green = verified, grey = remaining

export default function CompletionPieChart({ completedPercent = "0.00" }) {
    const verified = parseFloat(completedPercent);
    const remaining = 100 - verified;

    const data = [
        { name: 'Completed', value: verified },
        { name: 'Remaining', value: remaining }
    ];

    return (
        <Stack spacing={1} alignItems="center">
            <Typography variant="h6">Construction Completed</Typography>
            <ResponsiveContainer width={200} height={200}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        innerRadius={50}
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={2}
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            <Typography variant="body2" color="text.secondary">
                Completed: {verified.toFixed(0)}%
            </Typography>
        </Stack>
    );
}