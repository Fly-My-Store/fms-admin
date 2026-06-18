import PropTypes from 'prop-types';
import { useEffect } from 'react';

// next
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import Dot from 'components/@extended/Dot';
import IconButton from 'components/@extended/IconButton';

// third-party
import { FormattedMessage } from 'react-intl';

import { MenuOrientation, ThemeMode, NavActionType } from 'config';
import useConfig from 'hooks/useConfig';
import { handlerHorizontalActiveItem, handlerActiveItem, handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { matchesMenuRoute } from 'utils/menuRoute';

// assets
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';

// ==============================|| NAVIGATION - LIST ITEM ||============================== //

export default function NavItem({ item, level, isParents = false, setSelectedID }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const openItem = menuMaster.openedItem;

  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { mode, menuOrientation } = useConfig();
  let itemTarget = '_self';
  if (item.target) {
    itemTarget = '_blank';
  }

  const itemHandler = () => {
    if (downLG) handlerDrawerOpen(false);

    if (isParents && setSelectedID) {
      setSelectedID(item.id);
    }
  };

  const Icon = item.icon;
  const itemIcon = item.icon ? (
    <Icon
      style={{
        fontSize: drawerOpen ? '1rem' : '1.25rem',
        ...(menuOrientation === MenuOrientation.HORIZONTAL && isParents && { fontSize: 20, stroke: '1.5' })
      }}
    />
  ) : (
    false
  );

  const isSelected = openItem === item.id;

  const pathname = usePathname();

  // active menu item on page load
  useEffect(() => {
    if (item.url && matchesMenuRoute(pathname, item.url)) handlerActiveItem(item.id);
    // eslint-disable-next-line
  }, [pathname]);

  const textColor = mode === ThemeMode.DARK ? 'grey.400' : 'text.primary';
  const iconSelectedColor = mode === ThemeMode.DARK && drawerOpen ? 'text.primary' : 'primary.main';
  const isLegacy = Boolean(item.legacy);
  const labelColor = isLegacy && !isSelected ? 'text.disabled' : isSelected ? iconSelectedColor : textColor;

  const itemLabel = (
    <Typography
      variant="body2"
      noWrap
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        color: labelColor,
        fontWeight: isSelected ? 600 : 500,
        fontStyle: isLegacy && !isSelected ? 'italic' : 'normal'
      }}
    >
      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <FormattedMessage id={item.title} />
      </Box>
      {isLegacy && (
        <Tooltip title="Not used in production. Open for details." placement="right" arrow>
          <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0, lineHeight: 0, opacity: 0.55 }}>
            <InfoCircleOutlined style={{ fontSize: 12 }} />
          </Box>
        </Tooltip>
      )}
    </Typography>
  );

  const itemPadding = drawerOpen ? { pl: 2, pr: 1.5 } : { pl: 1.5, pr: 1.5 };

  const listItem = (
    <ListItemButton
      component={Link}
      href={item.url}
      target={itemTarget}
      disabled={item.disabled}
      selected={isSelected}
      sx={(theme) => ({
        zIndex: 1201,
        ...itemPadding,
        py: !drawerOpen && level === 1 ? 0.875 : 0.75,
        borderRadius: 1,
        mx: drawerOpen ? 1 : 0,
        mb: 0.25,
        ...(drawerOpen && {
          '&:hover': { bgcolor: 'primary.lighter', ...theme.applyStyles('dark', { bgcolor: 'divider' }) },
          '&.Mui-selected': {
            bgcolor: 'primary.lighter',
            ...theme.applyStyles('dark', { bgcolor: 'divider' }),
            color: iconSelectedColor,
            '&:hover': { color: iconSelectedColor, bgcolor: 'primary.lighter', ...theme.applyStyles('dark', { bgcolor: 'divider' }) }
          }
        }),
        ...(!drawerOpen && {
          justifyContent: 'center',
          '&:hover': { bgcolor: 'transparent' },
          '&.Mui-selected': { '&:hover': { bgcolor: 'transparent' }, bgcolor: 'transparent' }
        })
      })}
      {...(downLG && {
        onClick: () => {
          handlerDrawerOpen(false);
          itemHandler();
        }
      })}
    >
      {itemIcon && (
        <ListItemIcon
          sx={(theme) => ({
            minWidth: drawerOpen ? 32 : 0,
            color: isLegacy && !isSelected ? 'text.disabled' : isSelected ? iconSelectedColor : textColor,
            ...(!drawerOpen && {
              borderRadius: 1,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': { bgcolor: 'secondary.lighter', ...theme.applyStyles('dark', { bgcolor: 'secondary.light' }) }
            }),
            ...(!drawerOpen &&
              isSelected && {
                bgcolor: 'primary.lighter',
                ...theme.applyStyles('dark', { bgcolor: 'primary.900' }),
                '&:hover': { bgcolor: 'primary.lighter', ...theme.applyStyles('dark', { bgcolor: 'primary.darker' }) }
              })
          })}
        >
          {itemIcon}
        </ListItemIcon>
      )}
      {(drawerOpen || (!drawerOpen && level !== 1)) && (
        <ListItemText sx={{ flex: 1, minWidth: 0 }} primary={itemLabel} />
      )}
      {(drawerOpen || (!drawerOpen && level !== 1)) && item.chip && (
        <Chip
          color={item.chip.color}
          variant={item.chip.variant}
          size={item.chip.size}
          label={item.chip.label}
          avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
          sx={{ flexShrink: 0, ml: 0.5 }}
        />
      )}
    </ListItemButton>
  );

  return (
    <>
      {menuOrientation === MenuOrientation.VERTICAL || downLG ? (
        <Box sx={{ position: 'relative' }}>
          {!drawerOpen && level === 1 ? (
            <Tooltip title={<FormattedMessage id={item.title} />} placement="right" arrow>
              <Box component="span" sx={{ display: 'block' }}>
                {listItem}
              </Box>
            </Tooltip>
          ) : (
            listItem
          )}
          {(drawerOpen || (!drawerOpen && level !== 1)) &&
            item?.actions &&
            item?.actions.map((action, index) => {
              const ActionIcon = action.icon;
              const callAction = action?.function;
              return (
                <IconButton
                  key={index}
                  {...(action.type === NavActionType.FUNCTION && {
                    onClick: (event) => {
                      event.stopPropagation();
                      callAction();
                    }
                  })}
                  {...(action.type === NavActionType.LINK && {
                    component: Link,
                    href: action.url,
                    target: action.target ? '_blank' : '_self'
                  })}
                  color="secondary"
                  variant="outlined"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 20,
                    zIndex: 1202,
                    width: 20,
                    height: 20,
                    mr: -1,
                    ml: 1,
                    color: 'secondary.dark',
                    borderColor: isSelected ? 'primary.light' : 'secondary.light',
                    '&:hover': { borderColor: isSelected ? 'primary.main' : 'secondary.main' }
                  }}
                >
                  <ActionIcon style={{ fontSize: '0.625rem' }} />
                </IconButton>
              );
            })}
        </Box>
      ) : (
        <ListItemButton
          component={Link}
          href={item.url}
          target={itemTarget}
          disabled={item.disabled}
          selected={isSelected}
          onClick={() => {
            handlerHorizontalActiveItem(item.id);
            itemHandler();
          }}
          sx={{
            zIndex: 1201,
            ...(isParents && { p: 1, mr: 1 })
          }}
        >
          {itemIcon && (
            <ListItemIcon
              sx={{
                minWidth: 28,
                ...(!drawerOpen && {
                  borderRadius: 1.5,
                  width: 28,
                  height: 28,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  '&:hover': { bgcolor: 'transparent' }
                }),
                ...(!drawerOpen && isSelected && { bgcolor: 'transparent', '&:hover': { bgcolor: 'transparent' } })
              }}
            >
              {itemIcon}
            </ListItemIcon>
          )}

          {!itemIcon && (
            <ListItemIcon
              sx={{
                color: isSelected ? 'primary.main' : 'secondary.dark',
                ...(!drawerOpen && {
                  borderRadius: 1.5,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  '&:hover': { bgcolor: 'transparent' }
                }),
                ...(!drawerOpen && isSelected && { bgcolor: 'transparent', '&:hover': { bgcolor: 'transparent' } })
              }}
            >
              <Dot size={4} color={isSelected ? 'primary' : 'secondary'} />
            </ListItemIcon>
          )}
          <ListItemText
            sx={{ flex: 1, minWidth: 0 }}
            primary={itemLabel}
          />
          {item.chip && (
            <Chip
              color={item.chip.color}
              variant={item.chip.variant}
              size={item.chip.size}
              label={item.chip.label}
              avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
              sx={{ flexShrink: 0, ml: 0.5 }}
            />
          )}
        </ListItemButton>
      )}
    </>
  );
}

NavItem.propTypes = {
  item: PropTypes.any,
  level: PropTypes.number,
  isParents: PropTypes.bool,
  setSelectedID: PropTypes.oneOfType([PropTypes.any, PropTypes.func])
};
