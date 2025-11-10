'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
import axiosServices from 'utils/axios';

export default function SellerBankAccountsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ seller_id: '', account_holder_name: '', account_number: '', ifsc: '', is_primary: false });

  useEffect(() => {
    if (initialData) setForm({ ...{ seller_id: '', account_holder_name: '', account_number: '', ifsc: '', is_primary: false }, ...initialData });
    else setForm({ seller_id: '', account_holder_name: '', account_number: '', ifsc: '', is_primary: false });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (initialData?.id) await axiosServices.put('admin/sellers-stores/seller-bank-accounts/' + initialData.id, payload);
      else await axiosServices.post('admin/sellers-stores/seller-bank-accounts', payload);
      onSaved && onSaved();
      onClose();
    } catch (e) {}
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Seller Bank Account' : 'Add New Seller Bank Account'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='420px'>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Seller ID</InputLabel>
            <TextField id="seller_id" name="seller_id" value={form.seller_id || ''} onChange={(e)=>setForm(p=>({...p, seller_id: e.target.value}))} placeholder="Seller ID" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Account Holder Name</InputLabel>
            <TextField id="account_holder_name" name="account_holder_name" value={form.account_holder_name || ''} onChange={(e)=>setForm(p=>({...p, account_holder_name: e.target.value}))} placeholder="Account Holder Name" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Account Number</InputLabel>
            <TextField id="account_number" name="account_number" value={form.account_number || ''} onChange={(e)=>setForm(p=>({...p, account_number: e.target.value}))} placeholder="Account Number" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>IFSC</InputLabel>
            <TextField id="ifsc" name="ifsc" value={form.ifsc || ''} onChange={(e)=>setForm(p=>({...p, ifsc: e.target.value}))} placeholder="IFSC" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Is Primary</InputLabel>
            <TextField id="is_primary" name="is_primary" value={form.is_primary || ''} onChange={(e)=>setForm(p=>({...p, is_primary: e.target.value}))} placeholder="Is Primary" fullWidth />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>{initialData ? 'Update' : 'Submit'}</Button>
      </DialogActions>
    </Dialog>
  );
}

SellerBankAccountsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
