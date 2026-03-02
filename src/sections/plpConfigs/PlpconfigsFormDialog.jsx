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

export default function PlpconfigsFormDialog({ open, onClose, initialData = null, onSaved }) {
  const dispatch = useDispatch();
  const [form, setForm] = useState({ category_id: '', sort: '', filters_json: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ ...{ category_id: '', sort: '', filters_json: '' }, ...initialData });
    } else {
      setForm({ category_id: '', sort: '', filters_json: '' });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(attributes.plpConfigsUpdateRequest({ params: { id: initialData.id, data: form } }));
    } else {
      dispatch(attributes.plpConfigsCreateRequest({ params: form }));
    }
    if (onSaved) {
      onSaved();
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit PLP Config' : 'Add New PLP Config'}
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
            <InputLabel>Sort</InputLabel>
            <TextField id="sort" name="sort" type="text" value={form.sort || ''} onChange={handleChange} placeholder="Sort" fullWidth />
          </Stack>


          <Stack sx={{gap: 1}}>
            <InputLabel>Filters JSON</InputLabel>
            <TextField id="filters_json" name="filters_json" type="text" value={form.filters_json || ''} onChange={handleChange} placeholder="Filters JSON" fullWidth />
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

PlpconfigsFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
