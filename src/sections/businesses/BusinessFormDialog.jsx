'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

// MUI
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';

// Redux
import {
    fetchBusinessByIdRequest,
    createBusinessRequest,
    updateBusinessRequest
} from 'store/business/businessSlice';
import { IconButton } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';

export default function BusinessFormDialog({ open, onClose, initialData = null }) {
    const dispatch = useDispatch();
    const { business } = useSelector((state) => state.business);

    const [form, setForm] = useState({
        businessData: {
            name: '',
        },
        userData: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        }
    });

    // Fetch on edit
    useEffect(() => {
        if (initialData?.id) {
            dispatch(fetchBusinessByIdRequest(initialData.id));
        }
    }, [initialData, dispatch]);

    // Set form when fetched
    useEffect(() => {
        if (initialData?.id && business?.businessData?.id === initialData.id) {
            setForm({
                businessData: {
                    name: business.businessData.name,
                },
                userData: {
                    id: business.userData.id,
                    firstName: business.userData.firstName,
                    lastName: business.userData.lastName,
                    email: business.userData.email,
                    password: '',
                }
            });
        } else if (!initialData) {
            setForm({
                businessData: {
                    name: '',
                },
                userData: {
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                }
            });
        }
    }, [business, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('userData.')) {
            const key = name.split('.')[1];
            setForm((prev) => ({
                ...prev,
                userData: { ...prev.userData, [key]: value }
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                businessData: { ...prev.businessData, [name]: value }
            }));
        }
    };

    const handleSubmit = () => {
        if (initialData?.id) {
            dispatch(updateBusinessRequest({ id: initialData.id, data: form }));
        } else {
            dispatch(createBusinessRequest(form));
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {initialData ? 'Edit Business' : 'Add New Business'}
                <IconButton onClick={onClose}>
                    <CloseOutlined />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 1 }}>
                <Stack spacing={2} minWidth='400px' >
                    <Stack sx={{ gap: 1 }}>
                        <InputLabel>Business Name</InputLabel>
                        <TextField
                            name="name"
                            value={form.businessData.name}
                            onChange={handleChange}
                            placeholder="Business Name"
                            fullWidth
                        />
                    </Stack>
                    {/* <Stack sx={{ gap: 1 }}>
                        <InputLabel>Business Email</InputLabel>
                        <TextField
                            name="email"
                            value={form.businessData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            fullWidth
                        />
                    </Stack> */}

                    <Stack sx={{ gap: 1 }}>
                        <InputLabel>Admin First Name</InputLabel>
                        <TextField
                            name="userData.firstName"
                            value={form.userData.firstName}
                            onChange={handleChange}
                            placeholder="First Name"
                            fullWidth
                        />
                    </Stack>

                    <Stack sx={{ gap: 1 }}>
                        <InputLabel>Admin Last Name</InputLabel>
                        <TextField
                            name="userData.lastName"
                            value={form.userData.lastName}
                            onChange={handleChange}
                            placeholder="Last Name"
                            fullWidth
                        />
                    </Stack>

                    <Stack sx={{ gap: 1 }}>
                        <InputLabel>Email</InputLabel>
                        <TextField
                            name="userData.email"
                            value={form.userData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            fullWidth
                        />
                    </Stack>

                    <Stack sx={{ gap: 1 }}>
                        <InputLabel>Password</InputLabel>
                        <TextField
                            name="userData.password"
                            value={form.userData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            fullWidth
                        />
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    {initialData ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

BusinessFormDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    initialData: PropTypes.object
};