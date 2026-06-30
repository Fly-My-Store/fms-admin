'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import { CloseOutlined } from '@ant-design/icons';
import { actions as attributes } from 'store/attributes/slice';

export default function CategoryattrsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    category_id: '',
    attribute_code: '',
    is_required: false,
    is_variant_axis: false,
    is_filterable: false,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...{ category_id: '', attribute_code: '', is_required: false, is_variant_axis: false, is_filterable: false },
        ...initialData,
        is_required: initialData.is_required ?? false,
        is_variant_axis: initialData.is_variant_axis ?? false,
        is_filterable: initialData.is_filterable ?? false,
      });
    } else {
      setForm({ category_id: '', attribute_code: '', is_required: false, is_variant_axis: false, is_filterable: false });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(attributes.categoryAttrsUpdateRequest({ params: { id: initialData.id, data: form } }));
      enqueueSnackbar('Category attribute updated', { variant: 'success' });
    } else {
      dispatch(attributes.categoryAttrsCreateRequest({ params: form }));
      enqueueSnackbar('Category attribute created', { variant: 'success' });
    }
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Category Attribute' : 'Add New Category Attribute'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='400px'>

          <Stack sx={{gap: 1}}>
            <InputLabel>Category ID</InputLabel>
            <TextField id="category_id" name="category_id" type="text" value={form.category_id || ''} onChange={handleChange} placeholder="Category ID" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Attribute Code</InputLabel>
            <TextField id="attribute_code" name="attribute_code" type="text" value={form.attribute_code || ''} onChange={handleChange} placeholder="Attribute Code" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Required</InputLabel>
            <TextField 
              id="is_required" 
              name="is_required" 
              select
              value={form.is_required ? 'true' : 'false'} 
              onChange={(e) => handleChange({ target: { name: 'is_required', value: e.target.value === 'true' } })} 
              fullWidth
              size="small"
            >
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
            </TextField>
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Filterable</InputLabel>
            <TextField 
              id="is_filterable" 
              name="is_filterable" 
              select
              value={form.is_filterable ? 'true' : 'false'} 
              onChange={(e) => handleChange({ target: { name: 'is_filterable', value: e.target.value === 'true' } })} 
              fullWidth
              size="small"
            >
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
            </TextField>
          </Stack>

          <Stack sx={{gap: 1}}>
            <InputLabel>Variant picker axis</InputLabel>
            <TextField
              id="is_variant_axis"
              name="is_variant_axis"
              select
              value={form.is_variant_axis ? 'true' : 'false'}
              onChange={(e) => handleChange({ target: { name: 'is_variant_axis', value: e.target.value === 'true' } })}
              fullWidth
              size="small"
            >
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
            </TextField>
          </Stack>

        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {initialData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CategoryattrsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
