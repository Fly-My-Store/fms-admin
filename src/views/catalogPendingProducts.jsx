'use client';

import Stack from '@mui/material/Stack';
import CatalogPendingList, { Thumb } from 'views/catalogPendingList';
import {
  listProducts,
  approveProduct,
  approveProductsBulk,
  purgeProduct,
  purgeProductsBulk,
  purgeAllPendingProducts
} from 'api/catalog';

export default function CatalogPendingProductsView() {
  return (
    <CatalogPendingList
      title="Pending Products"
      searchPlaceholder="Name or slug…"
      loadRows={listProducts}
      approveOne={approveProduct}
      approveBulk={approveProductsBulk}
      purgeOne={purgeProduct}
      purgeBulk={purgeProductsBulk}
      purgeAll={purgeAllPendingProducts}
      editPath={(row) => `/products/edit/${row.id}`}
      columns={[
        {
          key: 'images',
          header: 'Images',
          render: (row) => (
            <Stack direction="row" spacing={0.5}>
              {(row.images || []).slice(0, 3).map((img) => (
                <Thumb key={img.id} url={img.url} alt={row.name} />
              ))}
            </Stack>
          )
        },
        { key: 'name', header: 'Name' },
        { key: 'slug', header: 'Slug' },
        {
          key: 'brand',
          header: 'Brand',
          render: (row) => row.brand?.name || '—'
        },
        {
          key: 'category',
          header: 'Category',
          render: (row) => row.category?.name || '—'
        },
        {
          key: 'description',
          header: 'Description',
          render: (row) => (row.description || '').slice(0, 60)
        }
      ]}
    />
  );
}
