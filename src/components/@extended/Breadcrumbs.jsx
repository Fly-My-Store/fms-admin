'use client';
import PropTypes from 'prop-types';

import { useEffect, useMemo, useState } from 'react';

// next
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// material-ui
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';

// third-party
import { FormattedMessage } from 'react-intl';

// project imports
import MainCard from 'components/MainCard';
import useMenuItems from 'hooks/useMenuItems';
import { ThemeDirection } from 'config';

// assets
import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import HomeFilled from '@ant-design/icons/HomeFilled';
import { Stack } from '@mui/system';
import { IconButton } from '@mui/material';
import { ArrowLeftOutlined } from '@ant-design/icons';

function resolveMenuTrail(menuGroups, pathname) {
  const walk = (nodes, ancestors) => {
    for (const node of nodes || []) {
      if (node.url === pathname) {
        const collapses = ancestors.filter((a) => a.type === 'collapse');
        return {
          main: collapses[collapses.length - 1] || null,
          item: node
        };
      }
      if (node.children?.length) {
        const hit = walk(node.children, [...ancestors, node]);
        if (hit) return hit;
      }
    }
    return null;
  };

  for (const group of menuGroups || []) {
    if (group?.type === 'group' && group.children?.length) {
      const hit = walk(group.children, []);
      if (hit) return hit;
    }
  }

  return { main: null, item: null };
}

export default function Breadcrumbs({
  card = false,
  custom = false,
  divider = false,
  heading,
  icon,
  icons,
  links,
  maxItems,
  rightAlign,
  separator,
  title = true,
  titleBottom = true,
  showBack,
  sx,
  ...others
}) {
  const theme = useTheme();
  const location = usePathname();
  const router = useRouter();
  const menuItems = useMenuItems();

  const [main, setMain] = useState(null);
  const [item, setItem] = useState(null);

  const iconSX = {
    marginRight: theme.direction === ThemeDirection.RTL ? 0 : theme.spacing(0.75),
    marginLeft: theme.direction === ThemeDirection.RTL ? theme.spacing(0.75) : 0,
    width: '1rem',
    height: '1rem',
    color: theme.palette.secondary.main
  };

  const menuKey = useMemo(() => JSON.stringify(menuItems.items || []), [menuItems.items]);

  useEffect(() => {
    if (custom) {
      setMain(null);
      setItem(null);
      return;
    }

    const trail = resolveMenuTrail(menuItems.items, location);
    setMain(trail?.main ?? null);
    setItem(trail?.item ?? null);
  }, [custom, location, menuKey, menuItems.items]);

  const SeparatorIcon = separator;
  const separatorIcon = separator ? <SeparatorIcon style={{ fontSize: '0.75rem', marginTop: 2 }} /> : '/';

  let mainContent;
  let itemContent;
  let breadcrumbContent = null;
  let CollapseIcon;
  let ItemIcon;

  if (!custom && main && main.type === 'collapse' && main.breadcrumbs !== false) {
    CollapseIcon = main.icon ? main.icon : ApartmentOutlined;
    mainContent = (
      <Typography variant="h6" color="text.secondary" sx={{ textDecoration: 'none' }}>
        {icons && <CollapseIcon style={iconSX} />}
        <FormattedMessage id={main.title} />
      </Typography>
    );
  }

  const showAuto = !custom && item && (item.type === 'item' || (item.type === 'group' && item.url));
  const showCustom = custom && links?.length > 0;
  const showBackButton = showBack ?? custom;

  if (showAuto || showCustom) {
    let tempContent;

    if (showCustom) {
      tempContent = (
        <MuiBreadcrumbs aria-label="breadcrumb" maxItems={maxItems || 8} separator={separatorIcon}>
          {links.map((link, index) => {
            CollapseIcon = link.icon ? link.icon : ApartmentOutlined;
            return (
              <Typography
                key={index}
                {...(link.to && { component: NextLink, href: link.to })}
                variant={!link.to ? 'subtitle1' : 'h6'}
                sx={{ textDecoration: 'none' }}
                color={!link.to ? 'text.primary' : 'text.secondary'}
              >
                {link.icon && <CollapseIcon style={iconSX} />}
                {link.i18n === false ? String(link.title) : <FormattedMessage id={link.title} />}
              </Typography>
            );
          })}
        </MuiBreadcrumbs>
      );
    } else {
      ItemIcon = item?.icon ? item.icon : ApartmentOutlined;
      itemContent = (
        <Typography variant="subtitle1" color="text.primary">
          {icons && <ItemIcon style={iconSX} />}
          <FormattedMessage id={item.title} />
        </Typography>
      );

      tempContent = (
        <MuiBreadcrumbs aria-label="breadcrumb" maxItems={maxItems || 8} separator={separatorIcon}>
          <Typography
            component={NextLink}
            href="/dashboard"
            color="text.secondary"
            variant="h6"
            sx={{ textDecoration: 'none' }}
          >
            {icons && <HomeOutlined style={iconSX} />}
            {icon && !icons && <HomeFilled style={{ ...iconSX, marginRight: 0 }} />}
            {(!icon || icons) && <FormattedMessage id="home" />}
          </Typography>
          {mainContent}
          {itemContent}
        </MuiBreadcrumbs>
      );
    }

    if (item?.breadcrumbs !== false || custom) {
      breadcrumbContent = (
        <MainCard
          border={card}
          sx={card === false ? { mb: 3, bgcolor: 'inherit', backgroundImage: 'none', ...sx } : { mb: 3, ...sx }}
          {...others}
          content={card}
          shadow="none"
        >
          <Grid
            container
            direction={rightAlign ? 'row' : 'column'}
            justifyContent={rightAlign ? 'space-between' : 'flex-start'}
            alignItems={rightAlign ? 'center' : 'flex-start'}
            spacing={1}
          >
            {title && !titleBottom && (
              <Grid>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {showBackButton && (
                    <IconButton onClick={() => router.back()} aria-label="go back">
                      <ArrowLeftOutlined />
                    </IconButton>
                  )}
                  <Typography variant="h2">
                    <FormattedMessage id={custom ? heading : item?.title} />
                  </Typography>
                </Stack>
              </Grid>
            )}
            <Grid>{tempContent}</Grid>
            {title && titleBottom && (
              <Grid sx={{ mt: card === false ? 0.25 : 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {showBackButton && (
                    <IconButton onClick={() => router.back()} color="primary" aria-label="go back">
                      <ArrowLeftOutlined />
                    </IconButton>
                  )}
                  <Typography variant="h2">
                    <FormattedMessage id={custom ? heading : item?.title} />
                  </Typography>
                </Stack>
              </Grid>
            )}
          </Grid>
          {card === false && divider !== false && <Divider sx={{ mt: 2 }} />}
        </MainCard>
      );
    }
  }

  return breadcrumbContent;
}

Breadcrumbs.propTypes = {
  card: PropTypes.bool,
  custom: PropTypes.bool,
  divider: PropTypes.bool,
  heading: PropTypes.string,
  icon: PropTypes.bool,
  icons: PropTypes.bool,
  links: PropTypes.array,
  maxItems: PropTypes.number,
  rightAlign: PropTypes.bool,
  separator: PropTypes.any,
  title: PropTypes.bool,
  titleBottom: PropTypes.bool,
  showBack: PropTypes.bool,
  sx: PropTypes.any,
  others: PropTypes.any
};
