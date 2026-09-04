'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useCan } from 'hooks/useCan';
import MainCard from 'components/MainCard';
import CatalogPendingBrandsView from 'views/catalogPendingBrands';
import CatalogPendingCategoriesView from 'views/catalogPendingCategories';
import CatalogPendingProductsView from 'views/catalogPendingProducts';
import CatalogPendingVariantsView from 'views/catalogPendingVariants';
import CatalogPendingImagesView from 'views/catalogPendingImages';

const QUEUES = [
  { id: 'brands', title: 'Brands', perm: 'brand' },
  { id: 'categories', title: 'Categories', perm: 'category' },
  { id: 'products', title: 'Products', perm: 'product' },
  { id: 'variants', title: 'Variants', perm: 'product' },
  { id: 'images', title: 'Images', perm: 'product' }
];

export default function CatalogPendingHubView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canModify, isLoaded } = useCan();
  const queues = useMemo(() => QUEUES.filter((q) => canModify(q.perm)), [canModify]);
  const requested = searchParams.get('tab');
  const tab = queues.some((q) => q.id === requested) ? requested : queues[0]?.id || '';

  useEffect(() => {
    if (!isLoaded || !queues.length) return;
    if (requested === tab) return;
    router.replace(`/catalog-pending?tab=${queues[0].id}`, { scroll: false });
  }, [isLoaded, queues, requested, tab, router]);

  const handleTabChange = (_e, value) => {
    router.replace(`/catalog-pending?tab=${value}`, { scroll: false });
  };

  if (!isLoaded) {
    return <MainCard content={false} title="Pending catalog" />;
  }

  return (
    <MainCard content={false} showTitle={false}>
      {!queues.length ? (
        <Box sx={{ p: 2 }}>
          <Typography color="text.secondary">You do not have permission to approve catalog items.</Typography>
        </Box>
      ) : (
        <>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            {queues.map((q) => (
              <Tab key={q.id} label={q.title} value={q.id} />
            ))}
          </Tabs>
          <Box sx={{ p: 2 }}>
            {tab === 'brands' && <CatalogPendingBrandsView embedded />}
            {tab === 'categories' && <CatalogPendingCategoriesView embedded />}
            {tab === 'products' && <CatalogPendingProductsView embedded />}
            {tab === 'variants' && <CatalogPendingVariantsView embedded />}
            {tab === 'images' && <CatalogPendingImagesView embedded />}
          </Box>
        </>
      )}
    </MainCard>
  );
}
