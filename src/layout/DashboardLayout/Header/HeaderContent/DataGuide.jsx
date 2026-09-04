'use client';

import { usePathname } from 'next/navigation';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import IconButton from 'components/@extended/IconButton';
import { headerIconSx } from './headerIconSx';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import { useDataGuide } from 'layout/DashboardLayout/DataGuideDrawer';

export default function DataGuide() {
  const pathname = usePathname();
  const { open, toggle } = useDataGuide();
  const onGuidePage = pathname === '/admin-data-guide' || pathname?.startsWith('/admin-data-guide/');

  if (onGuidePage) return null;

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <Tooltip title={open ? 'Close data guide' : 'Admin Data Guide'}>
        <IconButton
          color="secondary"
          variant="light"
          aria-label={open ? 'Close data guide' : 'Open data guide'}
          aria-pressed={open}
          onClick={toggle}
          sx={headerIconSx(open)}
        >
          <FileTextOutlined />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
