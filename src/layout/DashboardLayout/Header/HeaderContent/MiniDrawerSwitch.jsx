'use client';

import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from 'components/@extended/IconButton';
import { headerIconSx } from './headerIconSx';
import MenuFoldOutlined from '@ant-design/icons/MenuFoldOutlined';
import MenuUnfoldOutlined from '@ant-design/icons/MenuUnfoldOutlined';
import useConfig from 'hooks/useConfig';

export default function MiniDrawerSwitch() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { miniDrawer, onChangeMiniDrawer } = useConfig();

  if (downLG) return null;

  const compact = Boolean(miniDrawer);

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <Tooltip title={compact ? 'Keep full sidebar next visit' : 'Keep compact sidebar next visit'}>
        <IconButton
          color="secondary"
          variant="light"
          aria-label={compact ? 'Keep full sidebar next visit' : 'Keep compact sidebar next visit'}
          aria-pressed={compact}
          onClick={() => onChangeMiniDrawer(!compact)}
          sx={headerIconSx(compact)}
        >
          {compact ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
