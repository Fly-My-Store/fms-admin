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
import { actions as content } from 'store/content/slice';

export default function BannersFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ store_id: '', title: '', image_url: '', target_url: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ store_id: '', title: '', image_url: '', target_url: '' }, ...initialData });
    } else {
      setForm({ store_id: '', title: '', image_url: '', target_url: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(content.bannersUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(content.bannersCreateRequest({ params: form }));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Banner' : 'Add New Banner'}
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
            <InputLabel>Title</InputLabel>
            <TextField id="title" name="title" type="text" value={form.title || ''} onChange={handleChange} placeholder="Title" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Image URL</InputLabel>
            <TextField id="image_url" name="image_url" type="text" value={form.image_url || ''} onChange={handleChange} placeholder="Image URL" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Target URL</InputLabel>
            <TextField id="target_url" name="target_url" type="text" value={form.target_url || ''} onChange={handleChange} placeholder="Target URL" fullWidth />
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

BannersFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};
