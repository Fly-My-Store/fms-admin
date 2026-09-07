'use client';

import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import CsvJobsList from 'sections/csv/CsvJobsList';
import StoreListingCsvQueue from 'sections/stores/StoreListingCsvQueue';
import StoreVariantsBulkImportPanel from 'sections/stores/StoreVariantsBulkImportPanel';
import { abortStoreCsvJob, listStoreCsvJobs, storeCsvJobDownloadPath } from 'api/csvJobs';

export default function StoreBulkUploadTab({ storeId, isDemo }) {
  const [jobsTick, setJobsTick] = useState(0);
  const loadStoreJobs = useCallback(() => listStoreCsvJobs(storeId, { limit: 20 }), [storeId]);

  if (!storeId) return null;

  return (
    <Stack spacing={2}>
      <MainCard
        title="Bulk add listings"
        subheader="Upload a CSV to create store variants by SKU."
      >
        <StoreVariantsBulkImportPanel
          storeId={storeId}
          isDemo={isDemo}
          onQueued={() => setJobsTick((n) => n + 1)}
        />
      </MainCard>

      <CsvJobsList
        title="CSV jobs"
        loadJobs={loadStoreJobs}
        downloadPath={(jobId, file) => storeCsvJobDownloadPath(storeId, jobId, file)}
        abortJob={(jobId, body) => abortStoreCsvJob(storeId, jobId, body)}
        refreshKey={jobsTick}
        emptyText="Exports, listing updates, and bulk add jobs for this store show up here."
      />

      <StoreListingCsvQueue storeId={storeId} isDemo={isDemo} />
    </Stack>
  );
}

StoreBulkUploadTab.propTypes = {
  storeId: PropTypes.string,
  isDemo: PropTypes.bool
};
