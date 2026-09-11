'use client';

import { useMemo } from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { CopyOutlined, SendOutlined } from '@ant-design/icons';
import IconButton from 'components/@extended/IconButton';
import BasicReactTable from 'components/tables/basicTable';
import {
  getPushBroadcastAudienceLabel,
  getPushBroadcastStatusChipColor,
  getPushBroadcastStatusLabel,
  getPushBroadcastTemplateLabel
} from 'utils/pushBroadcastLabels';

function summaryLabel(row) {
  const s = row.summary_json || {};
  if (s.targeted == null && s.sent == null) return '—';
  return `${s.sent ?? 0}/${s.targeted ?? 0} sent`;
}

function canResendStatus(status) {
  return ['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(status);
}

export default function PushBroadcastsTableSection({
  rows,
  handleAddButton,
  handleViewButton,
  handleDuplicate,
  handleResend,
  resendingId,
  pageIndex,
  pageSize,
  totalPageCount,
  totalCount,
  onPaginationChange,
  topActionsLeft,
  showPagination = true
}) {
  const columns = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
        cell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ cursor: handleViewButton ? 'pointer' : 'default', color: 'primary.main' }}
            onClick={() => handleViewButton?.(row.original)}
          >
            {row.original.title}
          </Typography>
        )
      },
      {
        header: 'Audience',
        accessorKey: 'audience',
        cell: ({ row }) => getPushBroadcastAudienceLabel(row.original.audience)
      },
      {
        header: 'Template',
        accessorKey: 'template_key',
        cell: ({ row }) => getPushBroadcastTemplateLabel(row.original.template_key)
      },
      {
        header: 'Delivery',
        id: 'delivery',
        cell: ({ row }) => summaryLabel(row.original)
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => (
          <Chip
            size="small"
            label={getPushBroadcastStatusLabel(row.original.status)}
            color={getPushBroadcastStatusChipColor(row.original.status)}
          />
        )
      },
      {
        header: 'Created',
        id: 'created',
        cell: ({ row }) => {
          const v = row.original.createdAt || row.original.created_at;
          return v ? new Date(v).toLocaleString() : '—';
        }
      }
    ],
    [handleViewButton]
  );

  const tableActions = (row) => (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
      <Tooltip title="Duplicate">
        <IconButton color="primary" onClick={() => handleDuplicate?.(row)}>
          <CopyOutlined />
        </IconButton>
      </Tooltip>
      {canResendStatus(row.status) ? (
        <Tooltip title="Resend">
          <span>
            <IconButton
              color="warning"
              disabled={Boolean(resendingId)}
              onClick={() => handleResend?.(row)}
            >
              <SendOutlined />
            </IconButton>
          </span>
        </Tooltip>
      ) : null}
    </Stack>
  );

  return (
    <BasicReactTable
      columns={columns}
      data={rows}
      title="Push notifications"
      ariaLebel="Compose"
      handleAddButton={handleAddButton}
      handleViewButton={handleViewButton}
      tableActions={tableActions}
      pageIndex={pageIndex}
      pageSize={pageSize}
      totalPageCount={totalPageCount}
      totalCount={totalCount}
      onPaginationChange={onPaginationChange}
      topActionsLeft={topActionsLeft}
      showPagination={showPagination}
      permissionName="pushBroadcast"
    />
  );
}
