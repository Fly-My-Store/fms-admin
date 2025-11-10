'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';

// redux
import { createUserRequest, updateUserRequest } from 'store/user/userSlice';
import { IconButton, MenuItem, Select } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';

export default function UserFormDialog({ open, onClose, initialData = null }) {
    const dispatch = useDispatch();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        type: 'admin',
        roleId: '',
        password: ''
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                email: initialData.email || '',
                type: initialData.type || 'admin',
                status: initialData.status ?? 1,
                password: '',
            });
        } else {
            setForm({
                firstName: '',
                lastName: '',
                email: '',
                type: 'admin',
                status: 1,
                password: '',
            });
        }
    }, [initialData, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (initialData?.id) {
            dispatch(updateUserRequest({ id: initialData.id, data: form }));
        } else {
            dispatch(createUserRequest(form));
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {initialData ? 'Edit User' : 'Add New User'}
                <IconButton onClick={onClose}>
                    <CloseOutlined />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1} minWidth='400px' >
                    <Stack sx={{ gap: 1 }}>
                        <InputLabel>First Name</InputLabel>
                        <TextField
                            id="firstName"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            placeholder="First Name"
                            fullWidth
                        />
                    </Stack>
                    <Stack sx={{ gap: 1 }}>
                        <InputLabel>Last Name</InputLabel>
                        <TextField
                            id="lastName"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            placeholder="Last Name"
                            fullWidth
                        />
                    </Stack>

                    <Stack sx={{ gap: 1 }}>
                        <InputLabel> Email</InputLabel>
                        <TextField
                            id="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Email"
                            fullWidth
                        />
                    </Stack>

                

                    <Stack sx={{ gap: 1 }}>
                        <InputLabel>Password</InputLabel>
                        <TextField
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            fullWidth
                        />
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

UserFormDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    initialData: PropTypes.object
};