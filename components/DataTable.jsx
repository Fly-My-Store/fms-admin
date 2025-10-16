'use client';
import * as React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from '@mui/material';

export default function DataTable({ rows = [], columns = [], loading = false }) {
  return (
    <TableContainer component={Paper}>
      {loading ? <LinearProgress /> : null}
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map(col => <TableCell key={col.key}>{col.label}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={row.id ?? idx}>
              {columns.map(col => (
                <TableCell key={col.key}>
                  {String(row[col.key] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
