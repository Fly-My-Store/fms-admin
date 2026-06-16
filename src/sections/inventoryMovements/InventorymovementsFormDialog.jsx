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
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import { CloseOutlined } from '@ant-design/icons';
import { actions as listingsInventory } from 'store/listingsInventory/slice';

const REASONS = ['MANUAL', 'ADJUST', 'SALE', 'REFUND'];

export default function InventorymovementsFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    store_variant_id: '',
    delta: '',
    reason: 'MANUAL',
    ref_type: '',
    ref_id: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        store_variant_id: initialData.store_variant_id || '',
        delta: initialData.delta ?? '',
        reason: initialData.reason || 'MANUAL',
        ref_type: initialData.ref_type || '',
        ref_id: initialData.ref_id || '',
      });
    } else {
      setForm({
        store_variant_id: '',
        delta: '',
        reason: 'MANUAL',
        ref_type: '',
        ref_id: '',
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const payload = {
      store_variant_id: form.store_variant_id,
      delta: Number(form.delta),
      reason: form.reason,
      ref_type: form.ref_type || undefined,
      ref_id: form.ref_id || undefined,
    };
    dispatch(listingsInventory.inventoryMovementsCreateRequest({ params: payload }));
    onClose();
  };

  const readOnly = !!initialData?.id;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {readOnly ? 'Inventory Movement' : 'Add Inventory Movement'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth="400px">
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Store Variant ID</InputLabel>
            <TextField
              id="store_variant_id"
              name="store_variant_id"
              value={form.store_variant_id || ''}
              onChange={handleChange}
              placeholder="UUID of store_variant"
              fullWidth
              disabled={readOnly}
            />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Delta (+/- units)</InputLabel>
            <TextField
              id="delta"
              name="delta"
              type="number"
              value={form.delta}
              onChange={handleChange}
              placeholder="e.g. -2 or 10"
              fullWidth
              disabled={readOnly}
            />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Reason</InputLabel>
            <TextField
              id="reason"
              name="reason"
              select
              value={form.reason || 'MANUAL'}
              onChange={handleChange}
              fullWidth
              disabled={readOnly}
            >
              {REASONS.map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Ref Type</InputLabel>
            <TextField
              id="ref_type"
              name="ref_type"
              value={form.ref_type || ''}
              onChange={handleChange}
              placeholder="order, admin_manual, …"
              fullWidth
              disabled={readOnly}
            />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Ref ID</InputLabel>
            <TextField
              id="ref_id"
              name="ref_id"
              value={form.ref_id || ''}
              onChange={handleChange}
              placeholder="Optional reference id"
              fullWidth
              disabled={readOnly}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
        {!readOnly ? (
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

InventorymovementsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
};
