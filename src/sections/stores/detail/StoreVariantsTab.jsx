'use client';

import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import StoreVariantsGrid from 'sections/stores/StoreVariantsGrid';

export default function StoreVariantsTab({ storeId, isDemo, isRestaurant }) {
  if (!storeId) return null;

  if (isRestaurant) {
    return (
      <Stack spacing={2}>
        <Alert severity="info">
          For restaurant menus, use the <strong>Menu</strong> tab (CSV export / update / import).
          This grid is a read-only peek at listings — do not use grocery bulk import here.
        </Alert>
        <StoreVariantsGrid storeId={storeId} isDemo={isDemo} hideBulkPanels />
      </Stack>
    );
  }

  return <StoreVariantsGrid storeId={storeId} isDemo={isDemo} />;
}

StoreVariantsTab.propTypes = {
  storeId: PropTypes.string,
  isDemo: PropTypes.bool,
  isRestaurant: PropTypes.bool
};
