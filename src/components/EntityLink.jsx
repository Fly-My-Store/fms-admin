'use client';

import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { Link, Typography } from '@mui/material';

export default function EntityLink({ href, children, variant = 'body2', color = 'primary', sx }) {
  if (children == null || children === '') {
    return (
      <Typography variant={variant} color="text.secondary" sx={sx}>
        —
      </Typography>
    );
  }

  if (!href) {
    return (
      <Typography variant={variant} sx={sx}>
        {children}
      </Typography>
    );
  }

  return (
    <Link component={NextLink} href={href} underline="hover" variant={variant} color={color} sx={sx}>
      {children}
    </Link>
  );
}

EntityLink.propTypes = {
  href: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.string,
  color: PropTypes.string,
  sx: PropTypes.object
};
