'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';
import DragDropTable from 'components/tables/dragDropTable';

export default function ConstructionActivityTypeTableSection({ loading, activityTypes, handleAddButton, handleEditButton, handleUpdateSequence }) {
  const columns = useMemo(() => [
    {
      id: 'name',
      header: 'Construction Activity Type',
      accessorKey: 'name'
    },
    {
      id: 'sequence',
      header: 'Sequence',
      accessorKey: 'sequence'
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: (cell) => {
        const value = cell.getValue();
        switch (value) {
          case TABLE_STATUS.ACTIVE:
            return <Chip color="success" label="Active" size="small" variant="light" />;
          case TABLE_STATUS.ARCHIVE:
            return <Chip color="default" label="Archived" size="small" variant="light" />;
          default:
            return <Chip color="default" label="Unknown" size="small" variant="light" />;
        }
      }
    }
  ], []);

  return (
    <>
      <DragDropTable
        updateSequence={handleUpdateSequence}
        loading={loading}
        columns={columns}
        data={activityTypes}
        title="Construction Activity Types"
        ariaLebel="Add Construction Activity Type"
        handleAddButton={handleAddButton}
        handleEditButton={handleEditButton}
        showPagination={false}
        permissionName={'constructionActivityType'}
      />
    </>

  );
}