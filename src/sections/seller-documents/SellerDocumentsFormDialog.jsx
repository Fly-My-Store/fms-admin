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

export default function SellerDocumentsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ seller_id: '', doc_type: '', doc_number: '', file_url: '', status: '' });

  useEffect(() => {
    if (initialData) setForm({ ...{ seller_id: '', doc_type: '', doc_number: '', file_url: '', status: '' }, ...initialData });
    else setForm({ seller_id: '', doc_type: '', doc_number: '', file_url: '', status: '' });
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (initialData?.id) await axiosServices.put('admin/sellers-stores/seller-documents/' + initialData.id, payload);
      else await axiosServices.post('admin/sellers-stores/seller-documents', payload);
      onSaved && onSaved();
      onClose();
    } catch (e) {}
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Seller Document' : 'Add New Seller Document'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth='420px'>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Seller ID</InputLabel>
            <TextField id="seller_id" name="seller_id" value={form.seller_id || ''} onChange={(e)=>setForm(p=>({...p, seller_id: e.target.value}))} placeholder="Seller ID" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Doc Type</InputLabel>
            <TextField id="doc_type" name="doc_type" value={form.doc_type || ''} onChange={(e)=>setForm(p=>({...p, doc_type: e.target.value}))} placeholder="Doc Type" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Doc Number</InputLabel>
            <TextField id="doc_number" name="doc_number" value={form.doc_number || ''} onChange={(e)=>setForm(p=>({...p, doc_number: e.target.value}))} placeholder="Doc Number" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>File URL</InputLabel>
            <TextField id="file_url" name="file_url" value={form.file_url || ''} onChange={(e)=>setForm(p=>({...p, file_url: e.target.value}))} placeholder="File URL" fullWidth />
          </Stack>

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Status</InputLabel>
            <TextField id="status" name="status" value={form.status || ''} onChange={(e)=>setForm(p=>({...p, status: e.target.value}))} placeholder="Status" fullWidth />
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

SellerDocumentsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
