'use client';

import { Chip, Link, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import EntityLink from 'components/EntityLink';
import { formatAddressLine, formatReceiverLine, parsePrescriptionUrls } from 'utils/orderDisplay';
import { getOrderCustomerHref } from 'utils/orderLinks';

export default function OrderCustomerParty({ order }) {
  const addr = order?.delivery_address;
  const receiver = formatReceiverLine(order);
  const prescriptions = parsePrescriptionUrls(order?.prescription_url);

  return (
    <MainCard title="Customer">
      <Stack spacing={1}>
        <EntityLink href={getOrderCustomerHref(order)}>{order?.customer?.name || 'Customer'}</EntityLink>
        {order?.customer?.phone ? (
          <Typography variant="body2" color="text.secondary">
            {order.customer.phone}
          </Typography>
        ) : null}
        {order?.customer?.email ? (
          <Typography variant="body2" color="text.secondary">
            {order.customer.email}
          </Typography>
        ) : null}

        <Typography variant="subtitle2" sx={{ pt: 0.5 }}>
          Delivery address
        </Typography>
        {addr?.label ? (
          <Typography variant="caption" color="text.secondary">
            Saved as: {addr.label}
          </Typography>
        ) : null}
        <Typography variant="body2">{formatAddressLine(addr)}</Typography>
        {receiver ? (
          <Typography variant="body2" color="text.secondary">
            Receiver: {receiver}
          </Typography>
        ) : null}
        {order?.delivery_instructions ? (
          <Typography variant="body2" color="text.secondary">
            Instructions: {order.delivery_instructions}
          </Typography>
        ) : null}

        {prescriptions.length ? (
          <>
            <Typography variant="subtitle2" sx={{ pt: 0.5 }}>
              Prescription
            </Typography>
            {order?.prescription_rejected_at ? (
              <Chip size="small" color="warning" label="Rejected — customer asked to replace" variant="light" />
            ) : null}
            <Stack spacing={0.5}>
              {prescriptions.map((url) => (
                <Link key={url} href={url} target="_blank" rel="noopener noreferrer" variant="body2">
                  Open prescription
                </Link>
              ))}
            </Stack>
          </>
        ) : null}
      </Stack>
    </MainCard>
  );
}
