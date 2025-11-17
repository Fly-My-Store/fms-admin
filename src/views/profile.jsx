'use client';
import PropTypes from 'prop-types';

import { useEffect, useRef } from 'react';

// material-ui
import Grid from '@mui/material/Grid2';

// project imports

import { handlerActiveItem, useGetMenuMaster } from 'api/menu';
import { fetchUserByIdRequest } from 'store/user/userSlice';
import { useDispatch } from 'react-redux';

// ==============================|| PROFILE - USER ||============================== //

export default function UserProfile({ tab }) {
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const { menuMaster } = useGetMenuMaster();
  const openedItem = menuMaster.openedItem;

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (openedItem !== 'user-profile') handlerActiveItem('user-profile');
  }, [openedItem]);

  useEffect(() => {
    dispatch(fetchUserByIdRequest({ data: { returnAccess: true } }));
  }, [dispatch]);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 3 }}>
      </Grid>
    </Grid>
  );
}

UserProfile.propTypes = { tab: PropTypes.string };
