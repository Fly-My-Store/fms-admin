'use client';
import PropTypes from 'prop-types';

import { Fragment, useEffect, useMemo, useState } from 'react';

// material-ui
import { alpha } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';

// third-party
import { flexRender, useReactTable, getExpandedRowModel, getCoreRowModel } from '@tanstack/react-table';

// project imports
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import { CSVExport } from 'components/third-party/react-table';

// assets
import DownOutlined from '@ant-design/icons/DownOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import StopOutlined from '@ant-design/icons/StopOutlined';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { CONSTRUCTION_PLAN_VERIFICATION_MODE } from 'utils/constants';

// ==============================|| RENDER - SUB TABLE ||============================== //

function RenderSubComponent({ data, onRowClick, selectedPlan }) {
  const columns = useMemo(
    () => [
      { header: 'Floor Name', accessorKey: 'nameFloor' },
      {
        header: '# Images',
        accessorKey: 'imageCount',
        meta: {
          sx: { textAlign: 'center' }
        }
      },
      {
        header: '# Videos',
        accessorKey: 'videoCount',
        meta: {
          sx: { textAlign: 'center' }
        }
      },
      {
        header: 'Total %',
        accessorFn: (row) => `${row.weightage} %`,
        meta: {
          sx: { textAlign: 'center' }
        }
      },
      {
        header: 'Verified %',
        accessorFn: (row) => `${row.verifiedWeightage} %`,
        meta: {
          sx: { textAlign: 'center' }
        }
      },
      {
        header: 'Progress',
        accessorKey: 'progress',
        cell: ({ getValue, row }) => {
          const value = getValue();
          if (!value) return '';
          const verificationMode = row.original.verificationMode;
          const progressMap = {
            1: { label: 'Yet to Start', color: 'default' },
            2: { label: 'Submitted', color: 'warning' },
            3: {
              label: `Verified ${verificationMode === CONSTRUCTION_PLAN_VERIFICATION_MODE.SITE ? ' - Site Visit' : ' - Remote'}`,
              color: 'success'
            },
            4: { label: 'In Progress', color: 'info' }
          };
          const { label, color } = progressMap[value] || { label: 'Unknown', color: 'default' };
          return (
            <Chip
              label={label}
              size="small"
              variant="light"
              color={color}
            />
          );
        },
        meta: {
          sx: { textAlign: 'center' }
        }
      }
    ],
    []
  );

  return <TableSubRows {...{ columns, data, onRowClick, selectedPlan }} />;
}

function TableSubRows({ columns, data, onRowClick, selectedPlan }) {
  const table = useReactTable({
    data,
    columns,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel()
  });

  return (
    <>
      {table.getRowModel().rows.map((row, index) => (
        <TableRow
          sx={(theme) => ({
            bgcolor: (selectedPlan && selectedPlan.id === row.original.id) ? 'primary.lighter' : 'inherit',
            cursor: typeof onRowClick === 'function'
              ? 'pointer'
              : 'default',
          })}
          onClick={
            typeof onRowClick === 'function'
              ? () => onRowClick(row.original)
              : undefined
          }
          key={index}
          hover
        >
          <TableCell />
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} {...cell.column.columnDef.meta}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export default function ConstructionPlanTable({ data, onRowClick, selectedPlan, title, onResetPlanClick }) {

  const columns = useMemo(
    () => [
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          return row.original?.subPlan?.length > 0 ? (
            <IconButton color={row.getIsExpanded() ? 'primary' : 'secondary'} onClick={row.getToggleExpandedHandler()} size="small">
              {row.getIsExpanded() ? <MinusOutlined /> : <PlusOutlined />}
            </IconButton>
          ) : null;
        }
      },
      { header: 'Activity', accessorKey: 'name' },
      {
        header: '#Images',
        accessorKey: 'imageCount',
        meta: {
          sx: { textAlign: 'center' }
        }
      },
      {
        header: '#Videos',
        accessorKey: 'videoCount',
        meta: {
          sx: { textAlign: 'center' }
        }
      }, {
        header: 'Total',
        accessorFn: (row) => `${row.weightage} %`,
        meta: {
          sx: { textAlign: 'center' }
        }
      },
      {
        header: 'Verified',
        accessorFn: (row) => `${row.verifiedWeightage} %`,
        meta: {
          sx: { textAlign: 'center' }
        }
      },
      {
        header: 'Progress',
        accessorKey: 'progress',
        cell: ({ getValue, row }) => {
          const value = getValue();
          if (!value) return '';
          const verificationMode = row.original.verificationMode;
          const progressMap = {
            1: { label: 'Yet to Start', color: 'default' },
            2: { label: 'Submitted', color: 'warning' },
            3: {
              label: `Verified ${verificationMode === CONSTRUCTION_PLAN_VERIFICATION_MODE.SITE ? ' - Site Visit' : ' - Remote'}`,
              color: 'success'
            },
            4: { label: 'In Progress', color: 'info' }
          };
          const { label, color } = progressMap[value] || { label: 'Unknown', color: 'default' };
          return (
            <Chip
              label={label}
              size="small"
              variant="light"
              color={color}
            />
          );
        },
        meta: {
          sx: { textAlign: 'center' }
        }
      }
    ],
    []
  );

  const totalRow = useMemo(() => {
    const totalWeightage = data.reduce((acc, curr) => acc + (curr.weightage || 0), 0);
    const totalVerifiedWeightage = data.reduce((acc, curr) => acc + (curr.verifiedWeightage || 0), 0);
    const totalPhotos = data.reduce((acc, curr) => acc + (curr.imageCount || 0), 0);
    const totalVideos = data.reduce((acc, curr) => acc + (curr.videoCount || 0), 0);
    return {
      name: 'Total',
      weightage: totalWeightage,
      verifiedWeightage: totalVerifiedWeightage,
      imageCount: totalPhotos,
      videoCount: totalVideos,
      hideEdit: true,
      status: ''
    };
  }, [data]);

  const dataWithTotal = useMemo(() => [...data, totalRow], [data, totalRow]);

  const table = useReactTable({
    data: dataWithTotal,
    columns,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel()
  });

  const headers = [];
  table.getAllColumns().map(
    (columns) =>
      // @ts-expect-error Type 'string | undefined' is not assignable to type 'string'.
      columns.columnDef.accessorKey &&
      headers.push({
        label: typeof columns.columnDef.header === 'string' ? columns.columnDef.header : '#',
        // @ts-expect-error Type 'string | undefined' is not assignable to type 'string'.
        key: columns.columnDef.accessorKey
      })
  );

  return (
    <MainCard
      title={title}
      secondary={
        onResetPlanClick && <Button variant="outlined" color='inherited' onClick={onResetPlanClick}>
          Reset Construction Plan
        </Button>
      }
    >
      <ScrollX>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} sx={{ '& > th:first-of-type': { width: 58 } }}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id} {...header.column.columnDef.meta}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                return <Fragment key={row.id}>
                  <TableRow
                    hover
                    onClick={
                      !row.original.subPlan?.length && typeof onRowClick === 'function'
                        ? () => onRowClick(row.original)
                        : undefined
                    }
                    sx={{
                      cursor:
                        !row.original.subPlan?.length && typeof onRowClick === 'function'
                          ? 'pointer'
                          : 'default',
                      bgcolor: (selectedPlan && selectedPlan.id === row.original.id) ? 'primary.lighter' : 'inherit',
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && row.original?.subPlan?.length > 0 && <RenderSubComponent data={row.original?.subPlan} onRowClick={onRowClick} selectedPlan={selectedPlan} />}
                </Fragment>
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </ScrollX>
    </MainCard>
  );
}

TableSubRows.propTypes = { columns: PropTypes.array, data: PropTypes.array };

ConstructionPlanTable.propTypes = { columns: PropTypes.array, data: PropTypes.array };
