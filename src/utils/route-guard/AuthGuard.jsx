'use client';

import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';

// project imports
import Loader from 'components/Loader';
import { ROUTES } from 'utils/constants';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const { isLoaded, isLoggedIn, token } = useSelector((s) => s.auth || {});

  // Redirect once auth state is known
  useEffect(() => {
    if (!isLoaded) return;              // wait for hydration (hydrateFromStorage)
    if (!isLoggedIn || !token) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLoaded, isLoggedIn, token, router]);

  // Show loader until we know auth state
  if (!isLoaded) return <Loader />;

  // If logged out, render nothing (router will redirect)
  if (!isLoggedIn || !token) return null;

  return children;
}

AuthGuard.propTypes = {
  children: PropTypes.node
};