'use client';

import PropTypes from 'prop-types';
import { flexRender, useReactTable, getCoreRowModel, getPaginationRowModel } from '@tanstack/react-table';

// material-ui
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

// project imports
import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import { CSVExport, TablePagination } from 'components/third-party/react-table';
import IconButton from 'components/@extended/IconButton';

// assets
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import EditTwoTone from '@ant-design/icons/EditTwoTone';
import SendOutlined from '@ant-design/icons/SendOutlined';
import PlusCircleOutlined from '@ant-design/icons/PlusCircleOutlined';
import DeleteTwoTone from '@ant-design/icons/DeleteTwoTone';
import EyeTwoTone from '@ant-design/icons/EyeTwoTone';
import { Button } from '@mui/material';
import { useCan } from 'hooks/useCan';
import { useMemo } from 'react';

export function EditAction({ row, handleEditButton }) {
    return (
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <Tooltip title={'Edit'}>
                <IconButton
                    color={'primary'}
                    onClick={() => handleEditButton(row?.original)}
                >
                    <EditTwoTone />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}

function ViewAction({ row, handleViewButton }) {
    return (
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <Tooltip title={'View'}>
                <IconButton
                    color={'warning'}
                    onClick={() => handleViewButton(row.original)}
                >
                    <EyeTwoTone />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}


function DeleteAction({ row, handleDeleteButton }) {
    return (
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <Tooltip title={'Delete'}>
                <IconButton
                    color={'error'}
                    onClick={() => handleDeleteButton(row.original)}
                >
                    <DeleteTwoTone />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}


export default function BasicTable({
    columns,
    data,
    title,
    ariaLebel,
    handleAddButton,
    handleEditButton,
    handleViewButton,
    handleDeleteButton,
    pageIndex = 0,
    pageSize = 10,
    totalPageCount = 1,
    onPaginationChange = () => { },
    showTitle = true,
    showActions = true,
    showPagination = true,
    topActionsLeft,
    tableActions,
    topActions,
    subheader,
    innerContainer,
    totalCount = 0,
    onRowClick,
    permissionName,
}) {
    const { canRead, canCreate, canModify, canDelete, isLoaded } = useCan();

    // Resolve gates
    // const allowView = permissionName ? canRead(permissionName) : false;
    // const allowAdd = permissionName ? canCreate(permissionName) : false;
    // const allowEdit = permissionName ? canModify(permissionName) : false;
    // const allowDelete = permissionName ? canDelete(permissionName) : false;

     const allowView = true;
    const allowAdd = true;
    const allowEdit = true;
    const allowDelete = true;

    const cols = useMemo(() => {
        const hasActions =
            showActions &&
            (
                (handleViewButton && allowView) ||
                (handleEditButton && allowEdit) ||
                (handleDeleteButton && allowDelete) ||
                typeof tableActions === 'function'
            );

        if (!hasActions) return columns;
        const actionCol = {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }) => (
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                    {handleViewButton && allowView && <ViewAction row={row} handleViewButton={handleViewButton} />}
                    {handleEditButton && allowEdit && !row.original.hideEdit && <EditAction row={row} handleEditButton={handleEditButton} />}
                    {handleDeleteButton && allowDelete && <DeleteAction row={row} handleDeleteButton={handleDeleteButton} />}
                    {typeof tableActions === 'function' && tableActions(row.original)}
                </Stack>
            ),
            meta: { className: 'cell-center' }
        };

        return [...columns, actionCol];
    }, [columns, showActions, handleViewButton, handleEditButton, handleDeleteButton, tableActions, allowView, allowEdit, allowDelete]);

    const table = useReactTable({
        data,
        columns: cols,
        pageCount: totalPageCount,
        manualPagination: true,
        state: {
            pagination: {
                pageIndex,
                pageSize
            }
        },
        onPaginationChange,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),

    });

    const headers = table.getAllColumns().map((col) => ({
        label: typeof col.columnDef.header === 'string' ? col.columnDef.header : '#',
        key: col.columnDef.accessorKey
    }));

    return (
        <MainCard
            title={showTitle && title}
            secondary={
                showActions && (
                    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                        {topActionsLeft && topActionsLeft()}
                        {handleAddButton && allowAdd && (
                            <Button variant={'contained'} size="small" onClick={handleAddButton}>
                                {ariaLebel}
                            </Button>
                        )}
                        {topActions && topActions()}
                    </Stack>
                )
            }
            subheader={
                subheader && <Stack direction="row" sx={{ gap: 1, pt: 2.5, alignItems: 'center' }}>
                    {subheader()}
                </Stack>
            }
        >
            <ScrollX>
                <Stack>
                    {innerContainer && innerContainer()}
                    <TableContainer >
                        <Table>
                            <TableHead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableCell key={header.id} {...header.column.columnDef.meta}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHead>
                            <TableBody>
                                {table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        hover
                                        onClick={
                                            typeof onRowClick === 'function' ? () => onRowClick(row.original) : undefined
                                        }
                                        sx={{
                                            cursor: typeof onRowClick === 'function' ? 'pointer' : 'default',
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Divider />
                    {showPagination && <Box sx={{ pt: 2 }}>
                        <TablePagination
                            {...{
                                setPageSize: table.setPageSize,
                                setPageIndex: table.setPageIndex,
                                getState: table.getState,
                                getPageCount: table.getPageCount,
                                totalCount
                            }}
                        />
                    </Box>}
                </Stack>

            </ScrollX>
        </MainCard>
    );
}

BasicTable.propTypes = {
    columns: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    title: PropTypes.string,
    ariaLebel: PropTypes.string,
    handleAddButton: PropTypes.func,
    handleEditButton: PropTypes.func,
    handleViewButton: PropTypes.func,
    handleDeleteButton: PropTypes.func,
    pageIndex: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    totalPageCount: PropTypes.number.isRequired,
    onPaginationChange: PropTypes.func.isRequired,
    totalCount: PropTypes.number,
    onRowClick: PropTypes.func,

    permissionName: PropTypes.string,
};