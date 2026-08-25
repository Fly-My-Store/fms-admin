'use client';

import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import StoreListingCsvQueue from 'sections/stores/StoreListingCsvQueue';
import StoreVariantsBulkImportPanel from 'sections/stores/StoreVariantsBulkImportPanel';
import StoreVariantsImportResult from 'sections/stores/detail/StoreVariantsImportResult';

export default function StoreBulkUploadTab({ storeId, isDemo }) {
  const [lastImportResult, setLastImportResult] = useState(null);

  const handleImportDone = useCallback((data) => {
    setLastImportResult(data);
  }, []);

  if (!storeId) return null;

  return (
    <Stack spacing={2}>
      {lastImportResult ? (
        <StoreVariantsImportResult
          result={lastImportResult}
          onDismiss={() => setLastImportResult(null)}
        />
      ) : null}

      <MainCard
        title="Bulk add listings"
        subheader="Upload a CSV to create store variants by SKU."
      >
        <StoreVariantsBulkImportPanel storeId={storeId} isDemo={isDemo} onDone={handleImportDone} />
      </MainCard>

      <StoreListingCsvQueue storeId={storeId} isDemo={isDemo} />
    </Stack>
  );
}

StoreBulkUploadTab.propTypes = {
  storeId: PropTypes.string,
  isDemo: PropTypes.bool
};
