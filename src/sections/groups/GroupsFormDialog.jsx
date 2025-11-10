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
import { actions as attributes } from 'store/attributes/slice';

export default function GroupsFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ category_id: '', name: '', position: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ category_id: '', name: '', position: '' }, ...initialData });
    } else {
      setForm({ category_id: '', name: '', position: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(attributes.groupsUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(attributes.groupsCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Attribute Group' : 'Add New Attribute Group'}
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
            <InputLabel>Name</InputLabel>
            <TextField id="name" name="name" type="text" value={form.name || ''} onChange={handleChange} placeholder="Name" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Position</InputLabel>
            <TextField id="position" name="position" type="text" value={form.position || ''} onChange={handleChange} placeholder="Position" fullWidth />
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

GroupsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
