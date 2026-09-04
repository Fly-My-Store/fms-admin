'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from 'components/@extended/IconButton';
import { headerIconSx } from './headerIconSx';
import Transitions from 'components/@extended/Transitions';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import { ROUTES, STORAGE_KEYS } from 'utils/constants';
import { logout } from 'store/auth/authSlice';

export default function Logout() {
  const router = useRouter();
  const dispatch = useDispatch();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setOpen(false);
    router.push(ROUTES.LOGIN);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <Tooltip title="Logout">
        <IconButton
          ref={anchorRef}
          color="secondary"
          variant="light"
          aria-label="Logout"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={() => setOpen((v) => !v)}
          sx={headerIconSx(open)}
        >
          <LogoutOutlined />
        </IconButton>
      </Tooltip>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position="top-right" in={open} {...TransitionProps}>
            <Paper sx={(theme) => ({ boxShadow: theme.customShadows.z1, width: 280 })}>
              <ClickAwayListener onClickAway={handleClose}>
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1">Logout?</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    Do you want to logout?
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }} justifyContent="flex-end">
                    <Button color="secondary" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button color="error" variant="contained" onClick={handleLogout}>
                      Logout
                    </Button>
                  </Stack>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
