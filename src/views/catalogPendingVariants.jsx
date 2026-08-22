'use client';

import Stack from '@mui/material/Stack';
import CatalogPendingList, { Thumb } from 'views/catalogPendingList';
import {
  listAllVariants,
  approveVariant,
  approveVariantsBulk,
  purgeVariant,
  purgeVariantsBulk,
  purgeAllPendingVariants
} from 'api/catalog';

export default function CatalogPendingVariantsView() {
  return (
    <CatalogPendingList
      title="Pending Variants"
      searchPlaceholder="SKU or barcode…"
      loadRows={listAllVariants}
      approveOne={approveVariant}
      approveBulk={approveVariantsBulk}
      purgeOne={purgeVariant}
      purgeBulk={purgeVariantsBulk}
      purgeAll={purgeAllPendingVariants}
      editPath={(row) => `/product-variants/create?edit=${row.id}`}
      columns={[
        {
          key: 'images',
          header: 'Images',
          render: (row) => (
            <Stack direction="row" spacing={0.5}>
              {(row.images || []).slice(0, 3).map((img) => (
                <Thumb key={img.id} url={img.url} alt={row.sku} />
              ))}
            </Stack>
          )
        },
        { key: 'sku', header: 'SKU' },
        {
          key: 'product',
          header: 'Product',
          render: (row) => row.product?.name || '—'
        },
        { key: 'mrp', header: 'MRP' },
        { key: 'sale_price', header: 'Sale' },
        { key: 'barcode', header: 'Barcode' },
        {
          key: 'options',
          header: 'Options',
          render: (row) => row.option_signature || '—'
        }
      ]}
    />
  );
}
