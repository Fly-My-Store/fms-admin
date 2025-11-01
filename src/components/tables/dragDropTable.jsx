'use client';

import PropTypes from 'prop-types';
import { useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, Stack, LinearProgress, Tooltip
} from '@mui/material';

import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import IconButton from '@mui/material/IconButton';
import MainCard from 'components/MainCard';
import { DeleteTwoTone, EditTwoTone, EyeTwoTone } from '@ant-design/icons';
import { flexRender, useReactTable, getCoreRowModel } from '@tanstack/react-table';

import ScrollX from 'components/ScrollX';
import { DraggableRow } from 'components/third-party/react-table';
import { useCan } from 'hooks/useCan';

export function EditAction({ row, handleEditButton }) {
    return (
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <Tooltip title="Edit">
                <IconButton color="primary" onClick={() => handleEditButton(row?.original)}>
                    <EditTwoTone />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}

function ViewAction({ row, handleViewButton }) {
    return (
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <Tooltip title="View">
                <IconButton color="warning" onClick={() => handleViewButton(row.original)}>
                    <EyeTwoTone />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}

function DeleteAction({ row, handleDeleteButton }) {
    return (
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
            <Tooltip title="Delete">
                <IconButton color="error" onClick={() => handleDeleteButton(row.original)}>
                    <DeleteTwoTone />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}

export default function DragDropTable({
    columns,
    data,
    updateSequence,
    title,
    ariaLebel,
    handleAddButton,
    handleEditButton,
    handleViewButton,
    handleDeleteButton,
    showTitle = true,
    showActions = true,
    topActionsLeft,
    tableActions,
    topActions,
    subheader,
    loading,
    permissionName
}) {
    const { canRead, canCreate, canModify, canDelete } = useCan();

    // Resolve gates
    const allowView = permissionName ? canRead(permissionName) : false;
    const allowAdd = permissionName ? canCreate(permissionName) : false;
    const allowEdit = permissionName ? canModify(permissionName) : false;
    const allowDelete = permissionName ? canDelete(permissionName) : false;

    // Drag only when user can modify this resource
    const canDrag = !!allowEdit;

    const actionColumns = useMemo(() => {
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
                    {handleViewButton && allowView && (
                        <ViewAction row={row} handleViewButton={handleViewButton} />
                    )}
                    {handleEditButton && allowEdit && !row.original.hideEdit && (
                        <EditAction row={row} handleEditButton={handleEditButton} />
                    )}
                    {handleDeleteButton && allowDelete && (
                        <DeleteAction row={row} handleDeleteButton={handleDeleteButton} />
                    )}
                    {typeof tableActions === 'function' && tableActions(row.original)}
                </Stack>
            ),
            meta: { className: 'cell-center' }
        };

        return [...columns, actionCol];
    }, [
        columns,
        showActions,
        handleViewButton,
        handleEditButton,
        handleDeleteButton,
        tableActions,
        allowView,
        allowEdit,
        allowDelete
    ]);

    const table = useReactTable({
        data,
        columns: actionColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id?.toString?.() ?? String(row.id)
    });

    // Sensors only when drag is allowed
    const sensors = useSensors(
        ...(canDrag
            ? [
                useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
                useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
            ]
            : [])
    );

    const reorderRow = (draggedRowIndex, targetRowIndex) => {
        if (!canDrag) return;
        const reordered = arrayMove(data, draggedRowIndex, targetRowIndex);
        const sequenceData = reordered.map((item, index) => ({
            ...item,
            sequence: index + 1
        }));
        updateSequence(sequenceData);
    };

    const handleDragEnd = (event) => {
        if (!canDrag) return;
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            const draggedRowIndex = table.getRowModel().rows.findIndex(
                (row) => `row-${row.id}` === active.id
            );
            const targetRowIndex = table.getRowModel().rows.findIndex(
                (row) => `row-${row.id}` === over.id
            );
            reorderRow(draggedRowIndex, targetRowIndex);
        }
    };

    // Header cells as a pure array (no fragments/whitespace)
    const renderHeaderCells = (headerGroup) => {
        const cells = [];
        if (canDrag) cells.push(<TableCell key="__dragpad" />);
        headerGroup.headers.forEach((header) => {
            cells.push(
                <TableCell key={header.id} {...header.column.columnDef.meta}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableCell>
            );
        });
        return cells;
    };

    // Row cells as a pure array (no fragments/whitespace)
    const renderRowCells = (row) => {
        const cells = [];
        row.getVisibleCells().forEach((cell) => {
            cells.push(
                <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            );
        });
        return cells;
    };

    return (
        <MainCard
            title={showTitle && title}
            secondary={
                showActions && (
                    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
                        {topActionsLeft && topActionsLeft()}
                        {handleAddButton && allowAdd && (
                            <Button variant="contained" size="small" onClick={handleAddButton}>
                                {ariaLebel}
                            </Button>
                        )}
                        {topActions && topActions()}
                    </Stack>
                )
            }
            subheader={
                subheader && (
                    <Stack direction="row" sx={{ gap: 1, pt: 2.5, alignItems: 'center' }}>
                        {subheader()}
                    </Stack>
                )
            }
        >
            {loading && <LinearProgress sx={{ height: 2 }} />}

            <ScrollX>
                {canDrag ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id} sx={{ '& > th:first-of-type': { width: '58px' } }}>
                                            {renderHeaderCells(headerGroup)}
                                        </TableRow>
                                    ))}
                                </TableHead>
                                <TableBody>
                                    {table.getRowModel().rows.map((row) => (
                                        <DraggableRow key={row.id} row={row} reorderRow={reorderRow}>
                                            {renderRowCells(row)}
                                        </DraggableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DndContext>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {renderHeaderCells(headerGroup)}
                                    </TableRow>
                                ))}
                            </TableHead>
                            <TableBody>
                                {table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {renderRowCells(row)}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </ScrollX>
        </MainCard>
    );
}

DragDropTable.propTypes = {
    data: PropTypes.array.isRequired,
    columns: PropTypes.arrayOf(
        PropTypes.shape({ id: PropTypes.string, header: PropTypes.string, accessor: PropTypes.string })
    ).isRequired,
    updateSequence: PropTypes.func.isRequired,
    title: PropTypes.string,
    ariaLebel: PropTypes.string,
    handleAddButton: PropTypes.func,
    handleEditButton: PropTypes.func,
    handleViewButton: PropTypes.func,
    handleDeleteButton: PropTypes.func,
    showTitle: PropTypes.bool,
    showActions: PropTypes.bool,
    topActionsLeft: PropTypes.func,
    tableActions: PropTypes.func,
    topActions: PropTypes.func,
    subheader: PropTypes.func,
    loading: PropTypes.bool,
    permissionName: PropTypes.string
};