'use client';
import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';

// project imports
import { ThemeMode } from 'config';
import Image from 'next/image';
const logo = '/assets/images/logo_long.png';


// ==============================|| LOGO ||============================== //

export default function LogoMain({ reverse }) {
  const theme = useTheme();

  return (
    <>
      <Image src={logo} alt="fms" width={80} height={80} style={{
        objectFit: 'contain',
      }} />
    </>
  );
}

LogoMain.propTypes = { reverse: PropTypes.bool };
