'use client';

import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import IconButton from 'components/@extended/IconButton';
import { headerIconSx } from './headerIconSx';
import SunOutlined from '@ant-design/icons/SunOutlined';
import MoonOutlined from '@ant-design/icons/MoonOutlined';
import useConfig from 'hooks/useConfig';
import { ThemeMode } from 'config';

export default function ThemeModeToggle() {
  const { mode, onChangeMode } = useConfig();
  const isDark = mode === ThemeMode.DARK;

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
        <IconButton
          color="secondary"
          variant="light"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => onChangeMode(isDark ? ThemeMode.LIGHT : ThemeMode.DARK)}
          sx={headerIconSx(isDark)}
        >
          {isDark ? <SunOutlined /> : <MoonOutlined />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
