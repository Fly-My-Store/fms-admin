'use client';

import PropTypes from 'prop-types';
import EntityOrdersCard from 'sections/orders/EntityOrdersCard';

export default function StoreOrdersCard({ storeId }) {
  return <EntityOrdersCard storeId={storeId} />;
}

StoreOrdersCard.propTypes = {
  storeId: PropTypes.string
};
