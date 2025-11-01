'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { Stack, IconButton } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';

import {
  createPermissionRequest,
  updatePermissionRequest
} from 'store/rolePermission/rolePermissionSlice';

import { PERMISSION_NAMES, PERMISSION_SCOPE_MAP } from 'utils/constants';

export default function PermissionFormDialog({ open, onClose, initialData = null }) {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: '',
    description: '',
    scope: '', // 'platform' | 'business'
    status: 1
  });

  // Derive scope from name when editing, if scope missing
  useEffect(() => {
    if (initialData) {
      const next = {
        name: initialData.name || '',
        description: initialData.description || '',
        scope: initialData.scope || '',
        status: initialData.status ?? 1
      };
      if (!next.scope && next.name) {
        const s = PERMISSION_SCOPE_MAP[next.name] || '';
        next.scope = s === 'both' ? '' : s; // let user pick if 'both'
      }
      setForm(next);
    } else {
      setForm({ name: '', description: '', scope: '', status: 1 });
    }
  }, [initialData]);

  // Filtered list based on chosen scope
  const filteredPermissionNames = useMemo(() => {
    if (!form.scope) return PERMISSION_NAMES; // show all until scope chosen
    return PERMISSION_NAMES.filter((p) => {
      const s = PERMISSION_SCOPE_MAP[p] || 'both';
      return s === form.scope || s === 'both';
    });
  }, [form.scope]);

  // If current name no longer valid for the chosen scope, clear it
  useEffect(() => {
    if (!form.name) return;
    const s = PERMISSION_SCOPE_MAP[form.name] || 'both';
    if (form.scope && !(s === 'both' || s === form.scope)) {
      setForm((prev) => ({ ...prev, name: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.scope]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const payload = { ...form };
    if (initialData?.id) {
      dispatch(updatePermissionRequest({ id: initialData.id, data: payload }));
    } else {
      dispatch(createPermissionRequest(payload));
    }
    onClose();
    setForm({ name: '', description: '', scope: '', status: 1 });
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
        <Grid container spacing={2} mt={1} direction="column" minWidth="420px">
          {/* Scope first, so the name dropdown filters */}
          <Grid xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Scope</FormLabel>
              <RadioGroup
                row
                name="scope"
                value={form.scope}
                onChange={handleChange}
              >
                <FormControlLabel value="platform" control={<Radio />} label="Platform" />
                <FormControlLabel value="business" control={<Radio />} label="Business" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid xs={12}>
            <FormControl fullWidth>
              <InputLabel id="name-label">Feature Name</InputLabel>
              <Select
                labelId="name-label"
                id="name"
                name="name"
                value={form.name}
                label="Feature Name"
                onChange={handleChange}
              >
                {filteredPermissionNames.map((table) => (
                  <MenuItem key={table} value={table}>
                    {table}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid xs={12}>
            <TextField
              fullWidth
              name="description"
              label="Description"
              value={form.description}
              onChange={handleChange}
              multiline
              minRows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
}