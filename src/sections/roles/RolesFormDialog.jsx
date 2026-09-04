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
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { CloseOutlined } from '@ant-design/icons';
import { enqueueSnackbar } from 'notistack';
import { createRole, getRole, listPermissions, setRolePermissions, updateRole } from 'api/iam';
import { getErrorMessage } from 'utils/errors';

const CRUD = [
  { key: 'create', label: 'Create' },
  { key: 'read', label: 'Read' },
  { key: 'modify', label: 'Modify' },
  { key: 'delete', label: 'Delete' }
];

const emptyFlags = () => ({ create: false, read: false, modify: false, delete: false });

function toRoleCode(name, code) {
  return (
    String(code || name || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || `ROLE_${Date.now()}`
  );
}

export default function RolesFormDialog({ open, onClose, initialData = null, onSaved }) {
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [catalog, setCatalog] = useState([]);
  const [flagsById, setFlagsById] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setForm({
        name: initialData?.name || '',
        code: initialData?.code || '',
        description: initialData?.description || ''
      });
      try {
        const permResp = await listPermissions({ page: 1, limit: 100 });
        const rows = permResp?.data || [];
        if (cancelled) return;
        setCatalog(rows);
        const next = {};
        rows.forEach((p) => {
          next[p.id] = emptyFlags();
        });
        if (initialData?.id) {
          const roleResp = await getRole(initialData.id);
          const role = roleResp?.data || roleResp;
          (role?.permissions || []).forEach((p) => {
            if (!p?.id) return;
            next[p.id] = {
              create: !!p.create,
              read: !!p.read,
              modify: !!p.modify,
              delete: !!p.delete
            };
          });
        }
        if (!cancelled) setFlagsById(next);
      } catch (e) {
        if (!cancelled) {
          enqueueSnackbar(getErrorMessage(e, 'Failed to load permissions'), { variant: 'error' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setFlag = (id, key, value) => {
    setFlagsById((prev) => ({
      ...prev,
      [id]: { ...emptyFlags(), ...(prev[id] || {}), [key]: value }
    }));
  };

  const setRowAll = (id, value) => {
    setFlagsById((prev) => ({
      ...prev,
      [id]: { create: value, read: value, modify: value, delete: value }
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      enqueueSnackbar('Name is required', { variant: 'warning' });
      return;
    }
    setSaving(true);
    try {
      let roleId = initialData?.id;
      if (roleId) {
        await updateRole(roleId, {
          name: form.name.trim(),
          description: form.description.trim() || null
        });
      } else {
        const resp = await createRole({
          name: form.name.trim(),
          description: form.description.trim() || null,
          domain: 'ADMIN',
          code: toRoleCode(form.name, form.code)
        });
        roleId = resp?.data?.id || resp?.id;
      }
      if (!roleId) throw new Error('Role save did not return an id');
      const permissions = catalog.map((p) => ({
        permission_id: p.id,
        ...(flagsById[p.id] || emptyFlags())
      }));
      await setRolePermissions(roleId, permissions);
      enqueueSnackbar(initialData?.id ? 'Role updated' : 'Role created', { variant: 'success' });
      onSaved?.();
      onClose();
    } catch (e) {
      enqueueSnackbar(getErrorMessage(e, 'Save failed'), { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Role' : 'Add New Role'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel>Name</InputLabel>
            <TextField id="name" name="name" value={form.name || ''} onChange={handleChange} placeholder="Name" fullWidth />
          </Stack>

          {!initialData && (
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Code (optional)</InputLabel>
              <TextField
                id="code"
                name="code"
                value={form.code || ''}
                onChange={handleChange}
                placeholder="Generated from name if empty"
                fullWidth
              />
            </Stack>
          )}

          <Stack sx={{ gap: 1 }}>
            <InputLabel>Description</InputLabel>
            <TextField
              id="description"
              name="description"
              value={form.description || ''}
              onChange={handleChange}
              placeholder="Description"
              fullWidth
            />
          </Stack>

          {initialData?.code === 'SUPER_ADMIN' && (
            <Alert severity="info">Super Admin always has full API access, even if boxes below are cleared.</Alert>
          )}

          <Typography variant="subtitle2">Permissions</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Resource</TableCell>
                <TableCell align="center">All</TableCell>
                {CRUD.map((c) => (
                  <TableCell key={c.key} align="center">
                    {c.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {catalog.map((p) => {
                const flags = flagsById[p.id] || emptyFlags();
                const allOn = CRUD.every((c) => flags[c.key]);
                return (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Typography variant="body2">{p.description || p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox size="small" checked={allOn} disabled={loading} onChange={(e) => setRowAll(p.id, e.target.checked)} />
                    </TableCell>
                    {CRUD.map((c) => (
                      <TableCell key={c.key} align="center">
                        <Checkbox
                          size="small"
                          checked={!!flags[c.key]}
                          disabled={loading}
                          onChange={(e) => setFlag(p.id, c.key, e.target.checked)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving || loading}>
          {saving ? 'Saving…' : initialData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RolesFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};
