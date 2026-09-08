'use client';

import PropTypes from 'prop-types';
import { Box, Chip, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import EntityLink from 'components/EntityLink';
import { buildOrderTimeline } from 'utils/orderTimeline';

function formatTimelineDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function toneToColor(tone) {
  if (tone === 'success') return 'success.main';
  if (tone === 'error') return 'error.main';
  if (tone === 'info') return 'info.main';
  return 'primary.main';
}

export default function OrderTimeline({ order }) {
  const items = buildOrderTimeline(order);

  return (
    <MainCard title="Timeline">
      <Stack spacing={0}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Stack key={item.id} direction="row" spacing={1.5} alignItems="stretch">
              <Box sx={{ width: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: toneToColor(item.tone),
                    mt: 0.5,
                    flexShrink: 0
                  }}
                />
                {!isLast ? (
                  <Box sx={{ width: 2, flex: 1, bgcolor: 'grey.200', my: 0.5, minHeight: 16 }} />
                ) : null}
              </Box>
              <Box sx={{ pb: isLast ? 0 : 2, minWidth: 0, flex: 1 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5} justifyContent="space-between" alignItems={{ sm: 'baseline' }}>
                  <Typography variant="subtitle2">{item.title}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {formatTimelineDate(item.at)}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.25 }}>
                  <Chip size="small" label={item.group} variant="light" color={item.tone === 'default' ? 'default' : item.tone} />
                  {item.actor ? <Chip size="small" label={item.actor} variant="outlined" /> : null}
                </Stack>
                {item.links?.map((link) => (
                  <EntityLink key={link.href} href={link.href} sx={{ mt: 0.35, display: 'inline-block' }}>
                    {link.label}
                  </EntityLink>
                ))}
                {item.details.map((line) => (
                  <Typography key={line} variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                    {line}
                  </Typography>
                ))}
              </Box>
            </Stack>
          );
        })}
        {!items.length ? (
          <Typography variant="body2" color="text.secondary">
            No timeline yet
          </Typography>
        ) : null}
      </Stack>
    </MainCard>
  );
}

OrderTimeline.propTypes = {
  order: PropTypes.object
};
