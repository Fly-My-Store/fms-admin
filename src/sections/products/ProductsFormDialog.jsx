'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import { CloseOutlined } from '@ant-design/icons';
import { actions as catalog } from 'store/catalog/slice';

export default function ProductsFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', slug: '', brand_id: '', category_id: '', description: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ name: '', slug: '', brand_id: '', category_id: '', description: '' }, ...initialData });
    } else {
      setForm({ name: '', slug: '', brand_id: '', category_id: '', description: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(catalog.productsUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(catalog.productsCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Product' : 'Add New Product'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='400px'>

          <Stack sx={{gap: 1}}>
            <InputLabel>Name</InputLabel>
            <TextField id="name" name="name" type="text" value={form.name || ''} onChange={handleChange} placeholder="Name" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Slug</InputLabel>
            <TextField id="slug" name="slug" type="text" value={form.slug || ''} onChange={handleChange} placeholder="Slug" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Brand ID</InputLabel>
            <TextField id="brand_id" name="brand_id" type="text" value={form.brand_id || ''} onChange={handleChange} placeholder="Brand ID" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Category ID</InputLabel>
            <TextField id="category_id" name="category_id" type="text" value={form.category_id || ''} onChange={handleChange} placeholder="Category ID" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Description</InputLabel>
            <TextField id="description" name="description" type="text" value={form.description || ''} onChange={handleChange} placeholder="Description" fullWidth />
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

ProductsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
