'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import BasicReactTable from 'components/tables/basicTable';
import { TABLE_STATUS } from 'utils/constants';
import DragDropTable from 'components/tables/dragDropTable';

export default function ConstructionActivityTableSection({ loading, activities, handleAddButton, handleEditButton, handleUpdateSequence }) {
  const columns = useMemo(
    () => [
      {
        header: 'Activity Name',
        accessorKey: 'name'
      },
      {
        header: 'Activity Type',
        accessorFn: (row) => row.activityType?.name || '—'
      },
      {
        header: 'Activity Level',
        accessorFn: (row) => row.activityLevel?.name || '—'
      },
      {
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
    ],
    []
  );

  return (
    <DragDropTable
      updateSequence={handleUpdateSequence}
      loading={loading}
      columns={columns}
      data={activities}
      title="Construction Activities"
      ariaLebel="Add Construction Activity"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      showPagination={false}
      permissionName={'constructionActivity'}
    />
  );
}