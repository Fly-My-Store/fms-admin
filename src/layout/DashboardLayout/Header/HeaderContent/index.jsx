import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

// project imports
import Search from './Search';
import Message from './Message';
import Profile from './Profile';
import Localization from './Localization';
import Notification from './Notification';
import FullScreen from './FullScreen';
import MobileSection from './MobileSection';

import useConfig from 'hooks/useConfig';
import { MenuOrientation } from 'config';
import DrawerHeader from 'layout/DashboardLayout/Drawer/DrawerHeader';
import { Typography } from '@mui/material';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const { menuOrientation } = useConfig();
  const isDemoAdmin = useSelector((s) => Boolean(s.auth?.user?.is_tester));

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const localization = useMemo(() => <Localization />, []);

  return (
    <>
      {menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {false && <Search />}
      {false && !downLG && localization}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}

      {false && <Notification />}
      {false && <Message />} 
      {isDemoAdmin ? (
        <Typography variant="body" color="white" sx={{ width: '100%', textAlign: 'center' }}>
          Demo admin mode — changes apply to demo data only.
        </Typography>
      ):<Box sx={{ width: '100%'}} />}
      {!downLG && <FullScreen />}
      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
