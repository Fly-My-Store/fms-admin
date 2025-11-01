'use client';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSearchParams } from 'next/navigation';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthCodeVerification from 'sections/auth/auth-forms/AuthCodeVerification';
import { maskEmail } from 'utils/email';

// ================================|| CODE VERIFICATION ||================================ //

export default function CodeVerification() {

  const searchParams = useSearchParams();
  const encodedEmail = searchParams.get('email');
  const maskedEmail = encodedEmail ? maskEmail(atob(encodedEmail)) : '';

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack sx={{ gap: 1 }}>
            <Typography variant="h3">Enter Verification Code</Typography>
            <Typography color="secondary">We send you on mail.</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <Typography>We've sent you a code on <strong>{maskedEmail}</strong></Typography>
        </Grid>
        <Grid size={12}>
          <AuthCodeVerification />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
