'use client';

import PropTypes from 'prop-types';
import { useState, useMemo, useEffect } from 'react';

// material-ui
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';

// third-party
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

// project imports
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import { RowEditable } from 'components/third-party/react-table';

// assets
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import EditTwoTone from '@ant-design/icons/EditTwoTone';
import SendOutlined from '@ant-design/icons/SendOutlined';

function EditAction({ row, table }) {
    const meta = table?.options?.meta;

    const handleEditOrSave = (e) => {
        const isCancel = e?.currentTarget.name === 'cancel';

        if (!isCancel && meta?.handleSaveRow) {
            const updatedRow = table.getRowModel().rows[row.index].original;
            meta.handleSaveRow(updatedRow); // API Call from parent
        }

        meta?.setSelectedRow((old) => ({
            ...old,
            [row.id]: !old[row.id]
        }));

        if (meta?.revertData) {
            meta.revertData(row.index, isCancel);
        }
    };

    return (
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            {meta?.selectedRow[row.id] && (
                <Tooltip title="Cancel">
                    <IconButton color="error" name="cancel" onClick={handleEditOrSave}>
                        <CloseOutlined />
                    </IconButton>
                </Tooltip>
            )}
            <Tooltip title={meta?.selectedRow[row.id] ? 'Save' : 'Edit'}>
                <IconButton
                    color={meta?.selectedRow[row.id] ? 'success' : 'primary'}
                    onClick={handleEditOrSave}
                >
                    {meta?.selectedRow[row.id] ? <SendOutlined /> : <EditTwoTone />}
                </IconButton>
            </Tooltip>
        </Stack>
    );
}

export default function ReactTable({ columns, data, setData, handleSaveRow }) {
    const [selectedRow, setSelectedRow] = useState({});

    const table = useReactTable({
        data,
        columns: [
            ...columns,
            {
                header: 'Actions',
                id: 'edit',
                cell: EditAction,
                meta: { className: 'cell-center' }
            }
        ],
        defaultColumn: { cell: RowEditable },
        getCoreRowModel: getCoreRowModel(),
        meta: {
            selectedRow,
            setSelectedRow,
            handleSaveRow,
            revertData: (rowIndex, revert) => {
                if (revert) {
                    setData((old) => [...old]); 
                }
            },
            updateData: (rowIndex, columnId, value) => {
                setData((old) =>
                    old.map((row, index) =>
                        index === rowIndex ? { ...old[rowIndex], [columnId]: value } : row
                    )
                );
            }
        }
    });

    return (
        <ScrollX>
            <TableContainer>
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
                            <TableRow key={row.id}>
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
        </ScrollX>
    );
}

ReactTable.propTypes = {
    columns: PropTypes.array,
    data: PropTypes.array,
    setData: PropTypes.func,
    handleSaveRow: PropTypes.func
};