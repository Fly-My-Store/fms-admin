'use client';

import CatalogPendingList, { Thumb } from 'views/catalogPendingList';
import { approveImage, approveImagesBulk, listAllImages, purgeImage, purgeImagesBulk, purgeAllPendingImages } from 'api/catalog';

function ownerProduct(row) {
  return row.product || row.variant?.product;
}

export default function CatalogPendingImagesView({ embedded = false }) {
  return (
    <CatalogPendingList
      title="Pending Images"
      embedded={embedded}
      searchPlaceholder="Image URL, product, or SKU…"
      loadRows={listAllImages}
      approveOne={approveImage}
      approveBulk={approveImagesBulk}
      purgeOne={purgeImage}
      purgeBulk={purgeImagesBulk}
      purgeAll={purgeAllPendingImages}
      editPath={(row) =>
        row.variant
          ? `/product-variants/create?edit=${row.variant.id}`
          : `/products/edit/${row.product.id}`
      }
      columns={[
        {
          key: 'preview',
          header: 'Image',
          render: (row) => <Thumb url={row.url} alt={ownerProduct(row)?.name} />
        },
        {
          key: 'product',
          header: 'Product',
          render: (row) => ownerProduct(row)?.name || '—'
        },
        {
          key: 'owner',
          header: 'Owner',
          render: (row) => (row.variant ? `Variant: ${row.variant.sku}` : 'Product')
        },
        { key: 'role', header: 'Role' },
        {
          key: 'is_primary',
          header: 'Primary',
          render: (row) => (row.is_primary ? 'Yes' : 'No')
        },
        {
          key: 'url',
          header: 'URL',
          render: (row) => (
            <span title={row.url}>
              {row.url?.length > 55 ? `${row.url.slice(0, 55)}…` : row.url}
            </span>
          )
        }
      ]}
    />
  );
}
