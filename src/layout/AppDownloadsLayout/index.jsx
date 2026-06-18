'use client';

import PropTypes from 'prop-types';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

import Logo from 'components/logo';
import { APP_DEFAULT_PATH } from 'config';
import { ROUTES } from 'utils/constants';

export default function AppDownloadsLayout({ children }) {
  const { isLoggedIn, token } = useSelector((s) => s.auth || {});
  const isAuthed = Boolean(isLoggedIn && token);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
        {children}
      </Container>
    </Box>
  );
}

AppDownloadsLayout.propTypes = { children: PropTypes.node };
