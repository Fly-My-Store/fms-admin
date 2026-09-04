'use client';

import { useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import { headerIconSx } from '../headerIconSx';
import Transitions from 'components/@extended/Transitions';
import UserOutlined from '@ant-design/icons/UserOutlined';
import useUser from 'hooks/useUser';

export default function Profile() {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const active = pathname === '/profile' || pathname?.startsWith('/profile/');
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  if (!user?.isLoggedIn) return null;

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const goToProfile = () => {
    setOpen(false);
    router.push('/profile/personal');
  };

  const initial = (user.name || user.email || 'A').charAt(0).toUpperCase();

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <Tooltip title="Account">
        <IconButton
          ref={anchorRef}
          color="secondary"
          variant="light"
          aria-label="Account"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={() => setOpen((v) => !v)}
          sx={headerIconSx(open || active)}
        >
          {user.avatar ? <Avatar alt={user.name} src={user.avatar} size="xs" /> : <UserOutlined />}
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
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar alt={user.name} src={user.avatar || undefined} sx={{ width: 40, height: 40 }}>
                      {!user.avatar && initial}
                    </Avatar>
                    <Stack sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" noWrap sx={{ textTransform: 'capitalize' }}>
                        {user.name || 'Admin'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ textTransform: 'capitalize' }}>
                        {user.role || user.type}
                      </Typography>
                    </Stack>
                  </Stack>
                  {user.email ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }} noWrap>
                      {user.email}
                    </Typography>
                  ) : null}
                  {user.phone ? (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {user.phone}
                    </Typography>
                  ) : null}
                  <Button fullWidth variant="outlined" color="secondary" sx={{ mt: 2 }} onClick={goToProfile}>
                    View profile
                  </Button>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
