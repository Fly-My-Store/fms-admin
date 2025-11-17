'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import BasicReactTable from 'components/tables/basicTable';

const STATUS_META = {
  DRAFT: { color: 'default', label: 'Draft' },
  SUBMITTED: { color: 'warning', label: 'Submitted' },
  APPROVED: { color: 'success', label: 'Approved' },
  REJECTED: { color: 'error', label: 'Rejected' },
};

const RECORD_STATUS_META = {
  1: { color: 'success', label: 'Active' },
  2: { color: 'error', label: 'InActive' },
  3: { color: 'default', label: 'Archived' },
};

const fmtDateTime = (v) => (v ? new Date(v).toLocaleString() : '—');
const safe = (v) => (v == null || v === '' ? '—' : v);

export default function DefsTableSection({
  rows,
  handleAddButton,
  handleEditButton,
  pageIndex,
  pageSize,
  totalPageCount,
  onPaginationChange
}) {
  const columns = useMemo(
    () => [
      { header: 'Code', accessorKey: 'code' },
      { header: 'Name', accessorKey: 'name', cell: (c) => safe(c.getValue()) },
      { header: 'Data Type', accessorKey: 'data_type', cell: (c) => safe(c.getValue()) },
      { header: 'Unit', accessorKey: 'unit', cell: (c) => safe(c.getValue()) },

      // Allowed values summary: show first 2, +N more; full JSON on hover
      {
        header: 'Allowed Values',
        accessorKey: 'allowed_values',
        cell: (cell) => {
          const values = cell.getValue();
          if (!values || !Array.isArray(values) || values.length === 0) return '—';

          const toText = (x) =>
            typeof x === 'object' && x !== null
              ? x.label || x.code || JSON.stringify(x)
              : String(x);

          const sample = values.slice(0, 2).map(toText);
          const more = values.length - sample.length;
          const text = `${sample.join(', ')}${more > 0 ? ` +${more}` : ''}`;

          return (
            <Tooltip title={JSON.stringify(values)} placement="top" arrow>
              <span>{text}</span>
            </Tooltip>
          );
        }
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (cell) => {
          const s = cell.getValue();
          const meta = STATUS_META[s] || { color: 'default', label: s || 'Unknown' };
          return <Chip color={meta.color} label={meta.label} size="small" variant="light" />;
        }
      },
      {
        header: 'Record Status',
        accessorKey: 'record_status',
        cell: (cell) => {
          const s = cell.getValue();
          const meta = RECORD_STATUS_META[s] || { color: 'default', label: s || 'Unknown' };
          return <Chip color={meta.color} label={meta.label} size="small" variant="light" />;
        }
      },
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Attribute Definitions"
      ariaLebel="Add Attribute"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'attributeDef'}
    />
  );
}
