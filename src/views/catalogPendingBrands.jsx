'use client';

import CatalogPendingList, { Thumb } from 'views/catalogPendingList';
import {
  listBrands,
  approveBrand,
  approveBrandsBulk,
  purgeBrand,
  purgeBrandsBulk,
  purgeAllPendingBrands
} from 'api/catalog';

export default function CatalogPendingBrandsView() {
  return (
    <CatalogPendingList
      title="Pending Brands"
      searchPlaceholder="Name or slug…"
      loadRows={listBrands}
      approveOne={approveBrand}
      approveBulk={approveBrandsBulk}
      purgeOne={purgeBrand}
      purgeBulk={purgeBrandsBulk}
      purgeAll={purgeAllPendingBrands}
      editPath={(row) => `/brands/edit/${row.id}`}
      columns={[
        {
          key: 'logo',
          header: 'Logo',
          render: (row) => <Thumb url={row.logo_url} alt={row.name} />
        },
        { key: 'name', header: 'Name' },
        { key: 'slug', header: 'Slug' },
        {
          key: 'description',
          header: 'Description',
          render: (row) => (row.description || '').slice(0, 80)
        },
        {
          key: 'created_at',
          header: 'Created',
          render: (row) => (row.created_at || row.createdAt || '').toString().slice(0, 19)
        }
      ]}
    />
  );
}
