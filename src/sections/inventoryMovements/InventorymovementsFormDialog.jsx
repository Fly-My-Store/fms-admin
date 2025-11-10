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

export default function InventorymovementsFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ store_variant_id: '', qty_change: '', reason: '', ref: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ store_variant_id: '', qty_change: '', reason: '', ref: '' }, ...initialData });
    } else {
      setForm({ store_variant_id: '', qty_change: '', reason: '', ref: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(listingsInventory.inventoryMovementsUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(listingsInventory.inventoryMovementsCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Inventory Movement' : 'Add New Inventory Movement'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='400px'>

          <Stack sx={{gap: 1}}>
            <InputLabel>Store Variant ID</InputLabel>
            <TextField id="store_variant_id" name="store_variant_id" type="text" value={form.store_variant_id || ''} onChange={handleChange} placeholder="Store Variant ID" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Qty Change</InputLabel>
            <TextField id="qty_change" name="qty_change" type="text" value={form.qty_change || ''} onChange={handleChange} placeholder="Qty Change" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Reason</InputLabel>
            <TextField id="reason" name="reason" type="text" value={form.reason || ''} onChange={handleChange} placeholder="Reason" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Ref</InputLabel>
            <TextField id="ref" name="ref" type="text" value={form.ref || ''} onChange={handleChange} placeholder="Ref" fullWidth />
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

InventorymovementsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
