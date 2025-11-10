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
import { actions as iam } from 'store/iam/slice';

export default function PermissionsFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', create: '', read: '', modify: '', delete: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ name: '', create: '', read: '', modify: '', delete: '' }, ...initialData });
    } else {
      setForm({ name: '', create: '', read: '', modify: '', delete: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(iam.permissionsUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(iam.permissionsCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Permission' : 'Add New Permission'}
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
            <InputLabel>Create</InputLabel>
            <TextField id="create" name="create" type="text" value={form.create || ''} onChange={handleChange} placeholder="Create" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Read</InputLabel>
            <TextField id="read" name="read" type="text" value={form.read || ''} onChange={handleChange} placeholder="Read" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Modify</InputLabel>
            <TextField id="modify" name="modify" type="text" value={form.modify || ''} onChange={handleChange} placeholder="Modify" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Delete</InputLabel>
            <TextField id="delete" name="delete" type="text" value={form.delete || ''} onChange={handleChange} placeholder="Delete" fullWidth />
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

PermissionsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
