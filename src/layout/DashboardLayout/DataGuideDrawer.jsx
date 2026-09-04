'use client';

import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from 'components/@extended/IconButton';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import ExpandOutlined from '@ant-design/icons/ExpandOutlined';
import { AdminDataGuideContent } from 'views/adminDataGuide';

const DATA_GUIDE_WIDTH = 800;

const DataGuideContext = createContext(null);

export function useDataGuide() {
  const ctx = useContext(DataGuideContext);
  if (!ctx) {
    return { open: false, setOpen: () => {}, toggle: () => {} };
  }
  return ctx;
}

export function DataGuideProvider({ children }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);

  return (
    <DataGuideContext.Provider value={value}>
      {children}
      <DataGuideDrawer />
    </DataGuideContext.Provider>
  );
}

DataGuideProvider.propTypes = { children: PropTypes.node };

function DataGuideDrawer() {
  const router = useRouter();
  const pathname = usePathname();
  const { open, setOpen } = useDataGuide();
  const onGuidePage = pathname === '/admin-data-guide' || pathname?.startsWith('/admin-data-guide/');

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  const openFullPage = () => {
    setOpen(false);
    router.push('/admin-data-guide');
  };

  if (!open || onGuidePage) return null;

  return (
    <Drawer
      anchor="right"
      variant="persistent"
      open={open && !onGuidePage}
      sx={{
        '& .MuiDrawer-paper': {
          width: DATA_GUIDE_WIDTH,
          maxWidth: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          top: { xs: 56, sm: 64 },
          height: { xs: 'calc(100% - 56px)', sm: 'calc(100% - 64px)' },
          borderLeft: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}
      >
        <Typography variant="h5">Admin Data Guide</Typography>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Open full page">
            <IconButton
              color="secondary"
              variant="light"
              aria-label="Open data guide page"
              onClick={openFullPage}
              sx={{ color: 'text.primary' }}
            >
              <ExpandOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton
              color="secondary"
              variant="light"
              aria-label="Close data guide"
              onClick={() => setOpen(false)}
              sx={{ color: 'text.primary' }}
            >
              <CloseOutlined />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
        <AdminDataGuideContent />
      </Box>
    </Drawer>
  );
}
