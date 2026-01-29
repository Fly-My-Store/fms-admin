'use client';

import { useEffect, useState } from 'react';

// next
import NextLink from 'next/link';
import { getProviders, getCsrfToken } from 'next-auth/react';

// material-ui
import Grid from '@mui/material/Grid2';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';

export default function SignIn() {
  const [csrfToken, setCsrfToken] = useState(null);
  const [providers, setProviders] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [csrf, prov] = await Promise.all([getCsrfToken(), getProviders()]);
        if (!mounted) return;
        setCsrfToken(csrf || null);
        setProviders(prov || null);
      } catch {
        // ignore: login form can still work even if next-auth endpoints fail
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Login</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthLogin providers={providers} csrfToken={csrfToken} />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
