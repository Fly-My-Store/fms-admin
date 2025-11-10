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
import { actions as listingsInventory } from 'store/listingsInventory/slice';

export default function StoreproductsFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ store_id: '', product_id: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ store_id: '', product_id: '' }, ...initialData });
    } else {
      setForm({ store_id: '', product_id: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(listingsInventory.storeProductsUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(listingsInventory.storeProductsCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Store Product' : 'Add New Store Product'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='400px'>

          <Stack sx={{gap: 1}}>
            <InputLabel>Store ID</InputLabel>
            <TextField id="store_id" name="store_id" type="text" value={form.store_id || ''} onChange={handleChange} placeholder="Store ID" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Product ID</InputLabel>
            <TextField id="product_id" name="product_id" type="text" value={form.product_id || ''} onChange={handleChange} placeholder="Product ID" fullWidth />
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

StoreproductsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
