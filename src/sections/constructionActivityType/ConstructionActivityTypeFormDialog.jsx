'use client';

import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import {
    createActivityTypeRequest,
    updateActivityTypeRequest
} from 'store/constructionActivity/constructionActivitySlice';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import { CloseOutlined } from '@ant-design/icons';

const validationSchema = yup.object({
    name: yup.string().required('Type name is required'),
    sequence: yup
        .number()
        .typeError('Sequence must be a number')
        .integer('Sequence must be an integer')
        .required('Sequence is required'),
    status: yup.number().oneOf([1,2], 'Invalid status').required('Status is required')
});

export default function ConstructionActivityTypeFormDialog({ open, onClose, initialData = null }) {
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            name: '',
            sequence: '',
            status: 1
        },
        validationSchema,
        onSubmit: (values) => {
            const payload = {
                ...values,
                sequence: parseInt(values.sequence, 10)
            };
            if (initialData?.id) {
                dispatch(updateActivityTypeRequest({ id: initialData.id, data: payload }));
            } else {
                dispatch(createActivityTypeRequest(payload));
            }
            onClose();
        },
        enableReinitialize: true
    });

    useEffect(() => {
        if (initialData) {
            formik.setValues({
                name: initialData.name || '',
                sequence: initialData.sequence ?? '',
                status: initialData.status ?? 1
            });
        } else {
            formik.resetForm();
        }
    }, [initialData]);

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {initialData ? 'Edit Construction Activity Type' : 'Add Construction Activity Type'}
                <IconButton onClick={onClose}>
                    <CloseOutlined />
                </IconButton>
            </DialogTitle>

            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Stack spacing={2} mt={1} minWidth="400px">
                        <Stack sx={{ gap: 1 }}>
                            <InputLabel>Construction Activity Type Name</InputLabel>
                            <TextField
                                id="name"
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                                placeholder="Enter Construction Activity Type Name"
                                fullWidth
                            />
                        </Stack>

                        <Stack sx={{ gap: 1 }}>
                            <InputLabel>Sequence</InputLabel>
                            <TextField
                                id="sequence"
                                name="sequence"
                                type="number"
                                value={formik.values.sequence}
                                onChange={formik.handleChange}
                                error={formik.touched.sequence && Boolean(formik.errors.sequence)}
                                helperText={formik.touched.sequence && formik.errors.sequence}
                                placeholder="Enter Sequence"
                                fullWidth
                                disabled
                            />
                        </Stack>

                        <Stack sx={{ gap: 1 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                id="status"
                                name="status"
                                value={formik.values.status}
                                onChange={formik.handleChange}
                                error={formik.touched.status && Boolean(formik.errors.status)}
                                fullWidth
                            >
                                <MenuItem value={1}>Active</MenuItem>
                                <MenuItem value={2}>Inactive</MenuItem>
                            </Select>
                            {formik.touched.status && formik.errors.status && (
                                <FormHelperText error>{formik.errors.status}</FormHelperText>
                            )}
                        </Stack>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button variant="contained" type="submit">
                        {initialData ? 'Update' : 'Submit'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

ConstructionActivityTypeFormDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    initialData: PropTypes.object
};