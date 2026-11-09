'use client';

import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import MainCard from 'components/MainCard';
import CsvJobsList from 'sections/csv/CsvJobsList';
import RestaurantMenuExportPanel from 'sections/stores/restaurant/RestaurantMenuExportPanel';
import RestaurantMenuImportPanel from 'sections/stores/restaurant/RestaurantMenuImportPanel';
import RestaurantMenuUpdatePanel from 'sections/stores/restaurant/RestaurantMenuUpdatePanel';
import {
  abortRestaurantMenuCsvJob,
  listRestaurantMenuCsvJobs,
  restaurantMenuCsvJobDownloadPath
} from 'api/restaurantMenuCsv';

export default function StoreRestaurantMenuTab({ storeId, isDemo, menuSource }) {
  const [jobsTick, setJobsTick] = useState(0);
  const isPetpooja = String(menuSource || '').toLowerCase() === 'petpooja';
  const loadJobs = useCallback(() => listRestaurantMenuCsvJobs(storeId, { limit: 20 }), [storeId]);

  if (!storeId) return null;

  return (
    <Stack spacing={2}>
      {isPetpooja ? (
        <Alert severity="info">
          Petpooja owns this restaurant&apos;s menu structure. Export is available; import/update of
          structure is blocked.
        </Alert>
      ) : (
        <Alert severity="info">
          Use this tab for restaurant menu CSV — not grocery Variants / Bulk upload. Sellers can also
          edit dishes in the seller app when menu source is manual.
        </Alert>
      )}

      <MainCard title="Export menu" subheader="Download the full menu as one variant per row.">
        <RestaurantMenuExportPanel
          storeId={storeId}
          isDemo={isDemo}
          onQueued={() => setJobsTick((n) => n + 1)}
        />
      </MainCard>

      <MainCard title="Update menu" subheader="Re-upload an export to change prices, packing, stock, and copy.">
        <RestaurantMenuUpdatePanel
          storeId={storeId}
          isDemo={isDemo}
          isPetpooja={isPetpooja}
          onQueued={() => setJobsTick((n) => n + 1)}
        />
      </MainCard>

      <MainCard title="Import menu" subheader="Create dishes and variants for a manual restaurant.">
        <RestaurantMenuImportPanel
          storeId={storeId}
          isDemo={isDemo}
          isPetpooja={isPetpooja}
          onQueued={() => setJobsTick((n) => n + 1)}
        />
      </MainCard>

      <CsvJobsList
        title="Restaurant menu CSV jobs"
        loadJobs={loadJobs}
        downloadPath={(jobId, file) => restaurantMenuCsvJobDownloadPath(storeId, jobId, file)}
        abortJob={(jobId, body) => abortRestaurantMenuCsvJob(storeId, jobId, body)}
        refreshKey={jobsTick}
        emptyText="Menu export, update, and import jobs for this restaurant show up here."
      />
    </Stack>
  );
}

StoreRestaurantMenuTab.propTypes = {
  storeId: PropTypes.string,
  isDemo: PropTypes.bool,
  menuSource: PropTypes.string
};
