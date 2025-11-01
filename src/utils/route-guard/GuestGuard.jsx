'use client';

import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Loader from 'components/Loader';
import { APP_DEFAULT_PATH } from 'config';

export default function GuestGuard({ children }) {
  const router = useRouter();
  const { isLoaded, isLoggedIn, token } = useSelector((s) => s.auth || {});

  // If already authenticated, push them to the app's default page
  useEffect(() => {
    if (!isLoaded) return;                // wait for hydrateFromStorage to run
    if (isLoggedIn && token) {
      router.replace(APP_DEFAULT_PATH);
    }
  }, [isLoaded, isLoggedIn, token, router]);

  // Show loader until auth state is known to avoid flicker
  if (!isLoaded) return <Loader />;

  // If logged in, we're navigating away; render nothing
  if (isLoggedIn && token) return null;

  // Otherwise, allow access to guest page
  return children;
}

GuestGuard.propTypes = {
  children: PropTypes.node
};