'use client';

import { Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';

export default function AnalyticsView() {
  return (
    <MainCard border={false} boxShadow>
      <Stack spacing={2}>
        <Typography variant="h4">Analytics</Typography>
        <Typography variant="body2" color="text.secondary">
          Analytics dashboards and reports will be available here.
        </Typography>
      </Stack>
    </MainCard>
  );
}
