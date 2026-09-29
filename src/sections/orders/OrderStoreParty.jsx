'use client';

import { Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import EntityLink from 'components/EntityLink';
import { getOrderStoreHref } from 'utils/orderLinks';

export default function OrderStoreParty({ order }) {
  const store = order?.store;
  const phone = store?.phone || store?.support_phone;

  return (
    <MainCard title="Store · Seller">
      <Stack spacing={1}>
        <EntityLink href={getOrderStoreHref(order)}>{store?.name || 'Store'}</EntityLink>
        <Typography variant="body2" color="text.secondary">
          {store?.address_text || '—'}
        </Typography>
        {phone ? (
          <Typography variant="body2" color="text.secondary">
            {phone}
          </Typography>
        ) : null}
        {store?.id ? (
          <Typography variant="caption" color="text.secondary">
            Store ID: {store.id}
          </Typography>
        ) : null}
      </Stack>
    </MainCard>
  );
}
