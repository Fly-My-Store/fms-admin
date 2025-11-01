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

import {
  createBranchAccessRequest,
  updateBranchAccessRequest
} from 'store/branchAccess/branchAccessSlice';
import { IconButton } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';

export default function BranchAccessFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    userId: '',
    branchId: '',
    accessLevel: '',
    accessValue: '',
    status: 1
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        userId: initialData.userId || '',
        branchId: initialData.branchId || '',
        accessLevel: initialData.accessLevel || '',
        accessValue: initialData.accessValue || '',
        status: initialData.status ?? 1
      });
    } else {
      setForm({
        userId: '',
        branchId: '',
        accessLevel: '',
        accessValue: '',
        status: 1
      });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (initialData?.id) {
      dispatch(updateBranchAccessRequest({ id: initialData.id, data: form }));
    } else {
      dispatch(createBranchAccessRequest(form));
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Branch Access' : 'Add Branch Access'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1} minWidth="400px">
          {['userId', 'branchId', 'accessLevel', 'accessValue'].map((field) => (
            <Stack key={field} sx={{ gap: 1 }}>
              <InputLabel>{field[0].toUpperCase() + field.slice(1)}</InputLabel>
              <TextField
                id={field}
                name={field}
                value={form[field]}
                onChange={handleChange}
                placeholder={`Enter ${field}`}
                fullWidth
              />
            </Stack>
          ))}
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

BranchAccessFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};