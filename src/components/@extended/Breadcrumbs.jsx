'use client';

import PropTypes from 'prop-types';
import { useMemo } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';
import { ArrowLeftOutlined } from '@ant-design/icons';
import useMenuItems from 'hooks/useMenuItems';

/** Find menu item matching pathname; return nearest collapse parent + item. */
function resolveMenuTrail(menuGroups, pathname) {
  const walk = (nodes, ancestors) => {
    for (const node of nodes || []) {
      if (node.url === pathname) {
        const collapses = ancestors.filter((a) => a.type === 'collapse');
        return { main: collapses[collapses.length - 1] || null, item: node };
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
  return null;
}

function CrumbText({ title, to, i18n = true }) {
  return (
    <Typography
      {...(to ? { component: NextLink, href: to } : {})}
      variant={to ? 'h6' : 'subtitle1'}
      color={to ? 'text.secondary' : 'text.primary'}
      sx={{ textDecoration: 'none' }}
    >
      {i18n === false ? String(title) : <FormattedMessage id={title} />}
    </Typography>
  );
}

CrumbText.propTypes = {
  title: PropTypes.string,
  to: PropTypes.string,
  i18n: PropTypes.bool
};

/**
 * Auto (layout): derives crumbs + title from the menu for the current path.
 * Custom (detail/upsert): pass `custom`, `heading`, and `links`.
 */
export default function Breadcrumbs({
  custom = false,
  heading,
  links,
  title = true,
  showBack,
  divider = true,
  sx
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { items: menuItems = [] } = useMenuItems();

  const trail = useMemo(() => {
    if (custom) return null;
    return resolveMenuTrail(menuItems, pathname);
  }, [custom, menuItems, pathname]);

  const crumbs = useMemo(() => {
    if (custom) return Array.isArray(links) ? links : [];
    if (!trail?.item || trail.item.breadcrumbs === false) return [];
    const next = [{ title: 'home', to: '/dashboard' }];
    if (trail.main?.type === 'collapse' && trail.main.breadcrumbs !== false) {
      next.push({ title: trail.main.title });
    }
    next.push({ title: trail.item.title });
    return next;
  }, [custom, links, trail]);

  const headingId = custom ? heading : trail?.item?.title;
  const withBack = showBack ?? custom;

  if (!crumbs.length || (!custom && trail?.item?.breadcrumbs === false)) return null;

  return (
    <Stack spacing={1} sx={{ mb: 3, ...sx }}>
      <MuiBreadcrumbs aria-label="breadcrumb" separator="/">
        {crumbs.map((link, index) => (
          <CrumbText key={`${link.title}-${index}`} title={link.title} to={link.to} i18n={link.i18n} />
        ))}
      </MuiBreadcrumbs>

      {title && headingId ? (
        <Stack direction="row" alignItems="center" spacing={1}>
          {withBack ? (
            <IconButton onClick={() => router.back()} color="primary" aria-label="go back" size="small">
              <ArrowLeftOutlined />
            </IconButton>
          ) : null}
          <Typography variant="h2">
            <FormattedMessage id={headingId} />
          </Typography>
        </Stack>
      ) : null}

      {divider ? <Divider sx={{ mt: 1 }} /> : null}
    </Stack>
  );
}

Breadcrumbs.propTypes = {
  custom: PropTypes.bool,
  heading: PropTypes.string,
  links: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      to: PropTypes.string,
      i18n: PropTypes.bool
    })
  ),
  title: PropTypes.bool,
  showBack: PropTypes.bool,
  divider: PropTypes.bool,
  sx: PropTypes.object
};
