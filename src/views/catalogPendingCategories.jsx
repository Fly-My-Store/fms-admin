'use client';

import CatalogPendingList, { Thumb } from 'views/catalogPendingList';
import {
  listCategories,
  approveCategory,
  approveCategoriesBulk,
  purgeCategory,
  purgeCategoriesBulk,
  purgeAllPendingCategories
} from 'api/catalog';

export default function CatalogPendingCategoriesView() {
  return (
    <CatalogPendingList
      title="Pending Categories"
      searchPlaceholder="Name or slug…"
      loadRows={listCategories}
      approveOne={approveCategory}
      approveBulk={approveCategoriesBulk}
      purgeOne={purgeCategory}
      purgeBulk={purgeCategoriesBulk}
      purgeAll={purgeAllPendingCategories}
      editPath={(row) => `/categories/edit/${row.id}`}
      columns={[
        {
          key: 'icon',
          header: 'Icon',
          render: (row) => <Thumb url={row.icon_url} alt={row.name} />
        },
        { key: 'name', header: 'Name' },
        { key: 'slug', header: 'Slug' },
        {
          key: 'parent',
          header: 'Parent',
          render: (row) => row.parent?.name || '—'
        },
        { key: 'level', header: 'Level' },
        {
          key: 'description',
          header: 'Description',
          render: (row) => (row.description || '').slice(0, 80)
        }
      ]}
    />
  );
}
