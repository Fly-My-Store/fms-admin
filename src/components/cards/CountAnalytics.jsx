import PropTypes from 'prop-types';
import { useMemo } from 'react';

import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';

import MainCard from 'components/MainCard';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';

const iconSX = { fontSize: '1rem' };

export default function CountAnalytics({ title, count, subCount = null, unit = '', footerText = 'Current total' }) {
  const current = Number(count) || 0;
  const secondary = subCount !== null && subCount !== undefined ? Number(subCount) : null;

  const showSub = secondary !== null;

  const isGrowth = useMemo(() => current >= secondary, [current, secondary]);
  const change = useMemo(() => Math.abs(current - secondary).toFixed(0), [current, secondary]);
  const changeText = `${isGrowth ? 'Up' : 'Down'} by ${change}${unit ? ` ${unit}` : ''}`;

  return (
    <MainCard contentSX={{ p: 2.25 }} sx={{ height: '100%' }}>
      <Stack spacing={1} justifyContent="space-between" sx={{ height: '100%' }}>
        <div>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" color="inherit">
            {current} {unit}
          </Typography>
        </div>

       
      </Stack>
    </MainCard>
  );
}

CountAnalytics.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  subCount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  unit: PropTypes.string,
  footerText: PropTypes.string
};