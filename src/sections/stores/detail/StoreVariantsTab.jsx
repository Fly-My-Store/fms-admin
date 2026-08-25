'use client';

import PropTypes from 'prop-types';
import StoreVariantsGrid from 'sections/stores/StoreVariantsGrid';

export default function StoreVariantsTab({ storeId, isDemo }) {
  if (!storeId) return null;

  return <StoreVariantsGrid storeId={storeId} isDemo={isDemo} />;
}

StoreVariantsTab.propTypes = {
  storeId: PropTypes.string,
  isDemo: PropTypes.bool
};
