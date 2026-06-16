'use client';

import Link from 'next/link';
import { Grid, Stack, Typography, Button } from '@mui/material';
import MainCard from 'components/MainCard';

const QUICK_LINKS = [
  { title: 'Orders', description: 'View and manage customer orders', href: '/orders' },
  { title: 'Stores', description: 'Browse seller stores and listings', href: '/stores' },
  { title: 'Riders', description: 'Manage delivery riders and KYC', href: '/riders' },
  { title: 'Customers', description: 'View registered customer accounts', href: '/customers' },
];

export default function DashboardView() {
  return (
    <MainCard border={false} boxShadow>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4">Welcome</Typography>
          <Typography variant="body2" color="text.secondary">
            Fly My Store admin — quick links to common areas.
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {QUICK_LINKS.map((item) => (
            <Grid key={item.href} size={{ xs: 12, sm: 6, md: 3 }}>
              <MainCard content={false} sx={{ height: '100%' }}>
                <Stack spacing={1.5} sx={{ p: 2.5, height: '100%' }}>
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                    {item.description}
                  </Typography>
                  <Button component={Link} href={item.href} variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }}>
                    Open
                  </Button>
                </Stack>
              </MainCard>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </MainCard>
  );
}
