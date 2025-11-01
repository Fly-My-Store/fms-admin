'use client';

import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { TextField, Select, MenuItem, Stack } from '@mui/material';

export default function RowEditable({ getValue: initialValue, row, column: { id, columnDef }, table }) {
  const [value, setValue] = useState(initialValue);
  const isEditable = table.options.meta?.selectedRow[row.id];

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleBlur = () => {
    table.options.meta.updateData(row.index, id, value);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (!isEditable) return <>{value}</>;

  return (
    <>
      {columnDef.dataType === 'text' ? (
        <TextField
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          sx={{ '& .MuiOutlinedInput-input': { py: 0.75, px: 1 } }}
        />
      ) : (
        <Select
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          sx={{ '& .MuiOutlinedInput-input': { py: 0.75, px: 1 } }}
        >
          {(columnDef.options || []).map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      )}
    </>
  );
}

RowEditable.propTypes = {
  getValue: PropTypes.any,
  row: PropTypes.object,
  column: PropTypes.object,
  table: PropTypes.object
};