'use client';

import { useMemo } from 'react';
import { Chip } from '@mui/material';
import BasicReactTable from 'components/tables/basicTable';

function formatValue(r) {
  if (r == null) return '';
  // Prefer explicit value_* fields in a consistent priority
  if (r.value_json != null) {
    try {
      return JSON.stringify(r.value_json);
    } catch {
      return String(r.value_json);
    }
  }
  if (r.value_bool === true) return 'true';
  if (r.value_bool === false) return 'false';
  if (r.value_decimal != null && r.value_decimal !== '') return String(r.value_decimal);
  if (r.value_int != null && r.value_int !== '') return String(r.value_int);
  if (r.value_text != null && r.value_text !== '') return String(r.value_text);
  return '';
}

function formatNormalized(r) {
  const n = r?.normalized_num;
  if (n == null || n === '') return '';
  const u = r?.normalized_unit ? ` ${r.normalized_unit}` : '';
  return `${n}${u}`;
}

function StatusChip({ value }) {
  const v = String(value || '').toUpperCase();
  let color = 'default';
  switch (v) {
    case 'APPROVED':
      color = 'success';
      break;
    case 'SUBMITTED':
      color = 'warning';
      break;
    case 'REJECTED':
      color = 'error';
      break;
    case 'DISABLED':
      color = 'default';
      break;
    case 'DRAFT':
    default:
      color = 'default';
  }
  return <Chip size="small" color={color} label={v || '—'} variant="light" />;
}

export default function VariantAttrsTableSection({
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
      {
        header: 'Attribute',
        accessorKey: 'attribute_code',
        cell: (cell) => cell.row?.original?.attribute_code || cell.getValue?.() || cell.row?.original?.code || '—'
      },
      {
        header: 'Value',
        accessorKey: 'value_text', // keep a key for sorting; render from original
        cell: (cell) => {
          const r = cell.row?.original || {};
          return formatValue(r) || '—';
        }
      },
      {
        header: 'Normalized',
        accessorKey: 'normalized_num',
        cell: (cell) => {
          const r = cell.row?.original || {};
          const s = formatNormalized(r);
          return s || '—';
        }
      },
      {
        header: 'Unit',
        accessorKey: 'normalized_unit',
        cell: (cell) => cell.getValue?.() || cell.row?.original?.normalized_unit || '—'
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (cell) => <StatusChip value={cell.getValue?.() || cell.row?.original?.status} />
      },
      {
        header: 'Updated',
        accessorKey: 'updated_at',
        cell: (cell) => {
          const r = cell.row?.original || {};
          const ts = r.updated_at || r.updatedAt || r.created_at || r.createdAt;
          if (!ts) return '—';
          try {
            return new Date(ts).toLocaleString();
          } catch {
            return String(ts);
          }
        }
      }
    ],
    []
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Variant Attributes"
      ariaLebel="Add Variant Attribute"
      handleAddButton={handleAddButton}
      handleEditButton={handleEditButton}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      onPaginationChange={onPaginationChange}
      permissionName={'variantAttributeValue'}
    />
  );
}
