'use client';

import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from 'components/@extended/IconButton';
import { headerIconSx } from './headerIconSx';
import PicLeftOutlined from '@ant-design/icons/PicLeftOutlined';
import PicCenterOutlined from '@ant-design/icons/PicCenterOutlined';
import useConfig from 'hooks/useConfig';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { MenuOrientation } from 'config';

export default function SidebarToggle() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const { menuOrientation } = useConfig();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  if (isHorizontal || downLG) return null;

  return (
    <Box sx={{ flexShrink: 0, mr: 0.5 }}>
      <Tooltip title={drawerOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
        <IconButton
          color="secondary"
          variant="light"
          aria-label={drawerOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-pressed={drawerOpen}
          onClick={() => handlerDrawerOpen(!drawerOpen)}
          sx={headerIconSx(drawerOpen)}
        >
          {drawerOpen ? <PicCenterOutlined /> : <PicLeftOutlined />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
