import PropTypes from 'prop-types';
import { Fragment, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import useMediaQuery from '@mui/material/useMediaQuery';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

import { FormattedMessage } from 'react-intl';

import NavItem from './NavItem';
import SimpleBar from 'components/third-party/SimpleBar';
import Transitions from 'components/@extended/Transitions';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import { handlerHorizontalActiveItem, useGetMenuMaster } from 'api/menu';

import DownOutlined from '@ant-design/icons/DownOutlined';
import GroupOutlined from '@ant-design/icons/GroupOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';

const PopperStyled = styled(Popper)(({ theme }) => ({
  overflow: 'visible',
  zIndex: 1202,
  minWidth: 180,
  '&:before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    top: 5,
    left: 32,
    width: 12,
    height: 12,
    transform: 'translateY(-50%) rotate(45deg)',
    zIndex: 120,
    borderWidth: '6px',
    borderStyle: 'solid',
    borderColor: `${theme.palette.background.paper}  transparent transparent ${theme.palette.background.paper}`
  }
}));

const sectionTitleSx = {
  display: 'block',
  px: 2.5,
  pt: 1.25,
  pb: 0.5,
  color: 'text.secondary',
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  lineHeight: 1.4,
  textTransform: 'uppercase'
};

export default function NavGroup({ item, lastItem, remItems, lastItemId, selectedID, setSelectedID }) {
  const pathname = usePathname();
  const { menuOrientation } = useConfig();
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentItem, setCurrentItem] = useState(item);
  const openMini = Boolean(anchorEl);
  const isVertical = menuOrientation === MenuOrientation.VERTICAL || downLG;

  useEffect(() => {
    if (lastItem) {
      if (item.id === lastItemId) {
        const localItem = { ...item };
        localItem.children = remItems.map((ele) => ele.elements).flat(1);
        setCurrentItem(localItem);
      } else {
        setCurrentItem(item);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, lastItem, downLG]);

  const checkSelectedOnload = (data) => {
    data.children?.forEach((child) => {
      if (child?.url === pathname) {
        handlerHorizontalActiveItem(data.id);
        setSelectedID(data.id);
      }
    });
  };

  useEffect(() => {
    checkSelectedOnload(currentItem);
    if (openMini) setAnchorEl(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentItem]);

  const navItems = currentItem.children
    ?.filter((menuItem) => menuItem.type === 'item')
    .map((menuItem) => <NavItem key={menuItem.id} item={menuItem} level={1} />);

  if (isVertical) {
    return (
      <List
        disablePadding
        subheader={
          currentItem.title && drawerOpen ? (
            <Typography component="span" variant="overline" sx={sectionTitleSx}>
              <FormattedMessage id={currentItem.title} />
            </Typography>
          ) : null
        }
        sx={{ py: 0, ...(currentItem.title && drawerOpen && { mt: 0.25 }) }}
      >
        {navItems}
      </List>
    );
  }

  const isSelected = selectedID === currentItem.id || menuMaster.openedHorizontalItem === currentItem.id;
  const Icon = currentItem?.icon ? currentItem.icon : null;
  const itemIcon = Icon ? <Icon style={{ fontSize: 20, stroke: '1.5' }} /> : null;
  const popperId = openMini ? `group-pop-${item.id}` : undefined;

  const moreItems = remItems.flatMap((itemRem, i) => [
  <Fragment key={`rem-${i}`}>
    {itemRem.url ? <NavItem item={itemRem} level={1} /> : null}
    {itemRem?.elements?.filter((m) => m.type === 'item').map((menu) => <NavItem key={menu.id} item={menu} level={1} />)}
  </Fragment>
  ]);

  return (
    <List disablePadding>
      <ListItemButton
        selected={isSelected}
        sx={{ p: 1, my: 0.5, mr: 1, display: 'flex', alignItems: 'center', '&.Mui-selected': { bgcolor: 'transparent' } }}
        onMouseEnter={(e) => !openMini && setAnchorEl(e.currentTarget)}
        onClick={(e) => !openMini && setAnchorEl(e.currentTarget)}
        onMouseLeave={() => setAnchorEl(null)}
        aria-describedby={popperId}
        className={anchorEl ? 'Mui-selected' : ''}
      >
        {(itemIcon || currentItem.id === lastItemId) && (
          <ListItemIcon sx={{ minWidth: 28 }}>
            {currentItem.id === lastItemId ? <GroupOutlined style={{ fontSize: 20, stroke: '1.5' }} /> : itemIcon}
          </ListItemIcon>
        )}
        <ListItemText
          sx={{ mr: 1 }}
          primary={
            <Typography variant="body1" color={isSelected || anchorEl ? 'primary.main' : 'secondary.dark'}>
              <FormattedMessage id={currentItem.id === lastItemId ? 'more-items' : currentItem.title} />
            </Typography>
          }
        />
        {openMini ? <DownOutlined style={{ fontSize: 16, stroke: '1.5' }} /> : <RightOutlined style={{ fontSize: 16, stroke: '1.5' }} />}
        {anchorEl && (
          <PopperStyled id={popperId} open={openMini} anchorEl={anchorEl} placement="bottom-start" style={{ zIndex: 2001 }}>
            {({ TransitionProps }) => (
              <Transitions in={openMini} {...TransitionProps}>
                <Paper sx={(theme) => ({ mt: 0.5, py: 1.25, boxShadow: theme.shadows[8], backgroundImage: 'none' })}>
                  <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
                    <SimpleBar sx={{ minWidth: 200, overflowX: 'hidden', overflowY: 'auto', maxHeight: 'calc(100vh - 170px)' }}>
                      <Box sx={{ px: 0.5 }}>{currentItem.id !== lastItemId ? navItems : moreItems}</Box>
                    </SimpleBar>
                  </ClickAwayListener>
                </Paper>
              </Transitions>
            )}
          </PopperStyled>
        )}
      </ListItemButton>
    </List>
  );
}

NavGroup.propTypes = {
  item: PropTypes.any,
  lastItem: PropTypes.number,
  remItems: PropTypes.array,
  lastItemId: PropTypes.string,
  selectedID: PropTypes.oneOfType([PropTypes.any, PropTypes.string]),
  setSelectedID: PropTypes.oneOfType([PropTypes.any, PropTypes.func])
};
