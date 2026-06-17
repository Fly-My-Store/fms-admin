'use client';

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import DeliveriesList from 'sections/deliveries/DeliveriesList';

export default function RiderDeliveriesCard({ riderUserId, refreshKey }) {
  const filters = useMemo(
    () => (riderUserId ? { rider_id: riderUserId } : {}),
    [riderUserId]
  );

  if (!riderUserId) return null;

  return <DeliveriesList filters={filters} variant="rider" refreshKey={refreshKey} title="Deliveries" />;
}

RiderDeliveriesCard.propTypes = {
  riderUserId: PropTypes.string,
  refreshKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};
