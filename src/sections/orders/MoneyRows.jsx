'use client';

import { Divider, Stack, Typography } from '@mui/material';
import { formatINR } from 'utils/currency';

export function MoneyRow({ label, cents, hideZero = false, negative = false, bold = false }) {
  const n = Number(cents) || 0;
  if (hideZero && n === 0) return null;
  const value = negative && n > 0 ? `− ${formatINR(n)}` : formatINR(n);
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant={bold ? 'subtitle2' : 'body2'} color={bold ? 'text.primary' : 'text.secondary'}>
        {label}
      </Typography>
      <Typography variant={bold ? 'subtitle2' : 'body2'} color={negative && n > 0 ? 'error.main' : 'text.primary'}>
        {value}
      </Typography>
    </Stack>
  );
}

export function MoneyDivider() {
  return <Divider />;
}
