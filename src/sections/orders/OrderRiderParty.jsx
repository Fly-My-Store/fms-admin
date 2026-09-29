'use client';

import { Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import EntityLink from 'components/EntityLink';
import { getOrderDeliveryHref, getOrderRiderHref, nestedRiderProfile } from 'utils/orderLinks';
import { getDeliveryStatusLabel } from 'utils/orderStatusLabels';

export default function OrderRiderParty({ order }) {
  const delivery = order?.delivery;
  const riderUser = delivery?.rider;
  if (!riderUser) return null;

  const profile = nestedRiderProfile(riderUser);
  const vehicle = [profile?.vehicle_type, profile?.vehicle_number].filter(Boolean).join(' · ');

  return (
    <MainCard title="Rider">
      <Stack spacing={1}>
        <EntityLink href={getOrderRiderHref(order)}>{riderUser.name || 'Rider'}</EntityLink>
        {riderUser.phone ? (
          <Typography variant="body2" color="text.secondary">
            {riderUser.phone}
          </Typography>
        ) : null}
        {vehicle ? (
          <Typography variant="body2" color="text.secondary">
            {vehicle}
          </Typography>
        ) : null}
        <Typography variant="body2" color="text.secondary">
          Delivery:{' '}
          <EntityLink href={getOrderDeliveryHref(order)} variant="body2">
            {getDeliveryStatusLabel(delivery?.status) || '—'}
          </EntityLink>
        </Typography>
      </Stack>
    </MainCard>
  );
}
