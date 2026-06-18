'use client';
import { Fragment, useState } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import NavItem from './NavItem';
import NavGroup from './NavGroup';

import useConfig from 'hooks/useConfig';
import { HORIZONTAL_MAX_ITEM, MenuOrientation } from 'config';
import { useGetMenuMaster } from 'api/menu';
import useMenuItems from 'hooks/useMenuItems';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const { menuOrientation } = useConfig();
  const { menuMaster } = useGetMenuMaster();
  const menuItems = useMenuItems();

  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const [selectedID, setSelectedID] = useState('');

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  const lastItem = isHorizontal ? HORIZONTAL_MAX_ITEM : null;
  let lastItemIndex = menuItems.items.length - 1;
  let remItems = [];
  let lastItemId;

  if (lastItem && lastItem < menuItems.items.length) {
    lastItemId = menuItems.items[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = menuItems.items.slice(lastItem - 1, menuItems.items.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && { url: item.url })
    }));
  }

  const navGroups = menuItems.items.slice(0, lastItemIndex + 1).map((item, index) => {
    if (item.type !== 'group') {
      return (
        <Typography key={item.id} variant="h6" color="error" align="center">
          Fix - Navigation Group
        </Typography>
      );
    }

    if (item.url && item.id !== lastItemId) {
      return (
        <List key={item.id} disablePadding {...(isHorizontal && { sx: { mt: 0.5 } })}>
          <NavItem item={item} level={1} isParents setSelectedID={setSelectedID} />
        </List>
      );
    }

    return (
      <Fragment key={item.id}>
        <NavGroup
          setSelectedID={setSelectedID}
          selectedID={selectedID}
          lastItem={lastItem}
          remItems={remItems}
          lastItemId={lastItemId}
          item={item}
        />
      </Fragment>
    );
  });

  return (
    <Box
      sx={{
        px: drawerOpen ? 0 : 0.5,
        pt: 0.5,
        pb: 1,
        ...(!isHorizontal && { '& > ul:first-of-type': { mt: 0 } }),
        display: isHorizontal ? { xs: 'block', lg: 'flex' } : 'block'
      }}
    >
      {navGroups}
    </Box>
  );
}
