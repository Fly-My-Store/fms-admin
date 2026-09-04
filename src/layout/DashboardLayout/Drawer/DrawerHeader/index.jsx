import PropTypes from 'prop-types';
import NextLink from 'next/link';
import Image from 'next/image';

import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import DrawerHeaderStyled from './DrawerHeaderStyled';

import useConfig from 'hooks/useConfig';
import { APP_DEFAULT_PATH, MenuOrientation } from 'config';

const LOGO_SRC = '/assets/images/logo.png';

function BrandMark() {
  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        flexShrink: 0,
        borderRadius: 1.25,
        overflow: 'hidden',
        bgcolor: '#0D0D0D',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Image
        src={LOGO_SRC}
        alt=""
        width={40}
        height={40}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 28%' }}
      />
    </Box>
  );
}

export default function DrawerHeader({ open }) {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { menuOrientation } = useConfig();
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;
  const showName = open || isHorizontal;

  return (
    <DrawerHeaderStyled
      open={open}
      sx={{
        minHeight: isHorizontal ? 'unset' : 60,
        width: isHorizontal ? { xs: '100%', lg: '424px' } : '100%',
        px: isHorizontal ? { xs: 3, lg: 0 } : open ? 2 : 1,
        py: isHorizontal ? { xs: 1.25, lg: 0 } : 1.25,
        borderBottom: isHorizontal ? 'none' : '1px solid',
        borderBottomColor: 'divider'
      }}
    >
      <Tooltip title="Fly My Store Admin" placement="right" disableHoverListener={showName}>
        <Box
          component={NextLink}
          href={APP_DEFAULT_PATH}
          aria-label="Fly My Store Admin"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            minWidth: 0,
            color: 'inherit',
            textDecoration: 'none',
            width: showName ? 'auto' : '100%',
            justifyContent: showName ? 'flex-start' : 'center'
          }}
        >
          <BrandMark />
          {showName && (
            <Stack spacing={0} sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                noWrap
                sx={{ fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em' }}
              >
                Fly My Store
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', lineHeight: 1.3 }}>
                Admin
              </Typography>
            </Stack>
          )}
        </Box>
      </Tooltip>
    </DrawerHeaderStyled>
  );
}

DrawerHeader.propTypes = { open: PropTypes.bool };
