import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// next
import NextLink from 'next/link';

// material-ui
import { alpha } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import ProfileTab from './ProfileTab';
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

import useUser from 'hooks/useUser';
import { facebookColor, linkedInColor, twitterColor } from 'config';

// assets
import FacebookFilled from '@ant-design/icons/FacebookFilled';
import LinkedinFilled from '@ant-design/icons/LinkedinFilled';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import TwitterSquareFilled from '@ant-design/icons/TwitterSquareFilled';
import CameraOutlined from '@ant-design/icons/CameraOutlined';
import { useSelector } from 'react-redux';

// ==============================|| USER PROFILE - TAB CONTENT ||============================== //

export default function ProfileTabs({ focusInput }) {
  const { user } = useSelector((state) => state.user);
  const [selectedImage, setSelectedImage] = useState(undefined);
  const [avatar, setAvatar] = useState(user ? user.photo : undefined);


  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <MainCard>
      <Grid container spacing={6}>
        <Grid size={12}>
          <Stack sx={{ gap: 2.5, alignItems: 'center' }}>
            <FormLabel
              sx={{
                position: 'relative',
                borderRadius: '50%',
                overflow: 'hidden',
                '&:hover .MuiBox-root': { opacity: 1 },
              }}
            >
              {user && (
                <Avatar
                  alt={user.firstName}
                  src={avatar || undefined}
                  sx={{ width: 124, height: 124, border: '1px dashed', fontSize: '3rem' }}
                >
                  {!avatar && user.firstName?.charAt(0).toUpperCase()}
                </Avatar>
              )}
            </FormLabel>
            <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
              <Typography variant="h5">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography color="secondary">{user?.role?.name || 'Super Admin'}</Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid size={12}>
          <ProfileTab />
        </Grid>
      </Grid>
    </MainCard>
  );
}

ProfileTabs.propTypes = { focusInput: PropTypes.func };
