'use client';

import { useState } from 'react';
import __TABLE__ from 'sections/variant-attributes/VariantAttrsTableSection';
import __FORM__ from 'sections/variant-attributes/VariantAttrsFormDialog';
import useAxiosPaginatedList from 'hooks/useAxiosPaginatedList';
import OutOfScopeAttributeNotice from 'components/OutOfScopeAttributeNotice';

export default function VariantAttrsView() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const { rows, pageIndex, pageSize, totalPages, load, handlePaginationChange } = useAxiosPaginatedList(
    'admin/attributes/variant-attrs'
  );

  const handleDialogToggle = () => { setOpen((p) => !p); if (open) setSelected(null); };
  const handleAddButton = () => { setSelected(null); setOpen(true); };
  const handleEditButton = (row) => { setSelected(row); setOpen(true); };

  return (
    <>
      <__TABLE__
        rows={rows}
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalPageCount={totalPages}
        onPaginationChange={handlePaginationChange}
      />
      <__FORM__ open={open} onClose={handleDialogToggle} initialData={selected} onSaved={load} />
    </>
  );
}
