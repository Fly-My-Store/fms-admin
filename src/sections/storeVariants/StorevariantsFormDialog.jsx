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

export default function StorevariantsFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ store_id: '', variant_id: '', price: '', stock_qty: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ store_id: '', variant_id: '', price: '', stock_qty: '' }, ...initialData });
    } else {
      setForm({ store_id: '', variant_id: '', price: '', stock_qty: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(listingsInventory.storeVariantsUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(listingsInventory.storeVariantsCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Store Variant' : 'Add New Store Variant'}
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
            <InputLabel>Variant ID</InputLabel>
            <TextField id="variant_id" name="variant_id" type="text" value={form.variant_id || ''} onChange={handleChange} placeholder="Variant ID" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Price</InputLabel>
            <TextField id="price" name="price" type="text" value={form.price || ''} onChange={handleChange} placeholder="Price" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Stock Qty</InputLabel>
            <TextField id="stock_qty" name="stock_qty" type="text" value={form.stock_qty || ''} onChange={handleChange} placeholder="Stock Qty" fullWidth />
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

StorevariantsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
