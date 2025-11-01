'use client';

// next
import NextLink from 'next/link';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import AuthWrapper from 'sections/auth/AuthWrapper';
import { ROUTES } from 'utils/constants';

// ================================|| CHECK MAIL ||================================ //

export default function CheckMail() {
  const downSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Box sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Please Check Your Email</Typography>
            <Typography color="secondary" sx={{ mb: 0.5, mt: 1.25 }}>
              We have sent instructions to reset the password
            </Typography>
          </Box>
        </Grid>
        <Grid size={12}>
          <AnimateButton>
            <NextLink href={ROUTES.LOGIN}>
              <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="primary">
                Sign in
              </Button>
            </NextLink>
          </AnimateButton>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
