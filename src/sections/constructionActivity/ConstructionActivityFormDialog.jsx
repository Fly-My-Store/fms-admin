'use client';

import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    createActivityRequest,
    updateActivityRequest,
    fetchActivityTypesRequest,
    fetchActivityLevelsRequest
} from 'store/constructionActivity/constructionActivitySlice';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import { CloseOutlined } from '@ant-design/icons';

const validationSchema = yup.object({
    name: yup.string().required('Activity name is required'),
    sequence: yup
        .number()
        .typeError('Sequence must be a number')
        .integer('Must be an integer')
        .required('Sequence is required'),
    typeId: yup.string().required('Activity type is required'),
    levelId: yup.string().required('Activity level is required'),
    status: yup.number().oneOf([1, 2], 'Invalid status').required('Status is required')
});

export default function ConstructionActivityFormDialog({ open, onClose, initialData = null }) {
    const dispatch = useDispatch();
    const { activityLevels, activityTypes } = useSelector((state) => state.constructionActivity);

    const formik = useFormik({
        initialValues: {
            name: '',
            sequence: '',
            typeId: '',
            levelId: '',
            status: 1
        },
        validationSchema,
        onSubmit: (values) => {
            const payload = {
                ...values,
                sequence: parseInt(values.sequence, 10)
            };
            if (initialData?.id) {
                dispatch(updateActivityRequest({ id: initialData.id, data: payload }));
            } else {
                dispatch(createActivityRequest(payload));
            }
            onClose();
        },
        enableReinitialize: true
    });

    useEffect(() => {
        dispatch(fetchActivityTypesRequest({ active: true }));
        dispatch(fetchActivityLevelsRequest({ active: true }));
    }, [dispatch]);

    useEffect(() => {
        if (initialData) {
            formik.setValues({
                name: initialData.name || '',
                sequence: initialData.sequence ?? '',
                typeId: initialData.typeId || '',
                levelId: initialData.levelId || '',
                status: initialData.status ?? 1
            });
        } else {
            formik.resetForm();
        }
    }, [initialData]);

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {initialData ? 'Edit Activity' : 'Add Activity'}
                <IconButton onClick={onClose}>
                    <CloseOutlined />
                </IconButton>
            </DialogTitle>

            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Stack spacing={2} mt={1} minWidth="400px">
                        <Stack sx={{ gap: 1 }}>
                            <InputLabel>Construction Activity Name</InputLabel>
                            <TextField
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                                placeholder="Enter activity name"
                                fullWidth
                            />
                        </Stack>

                        <Stack sx={{ gap: 1 }}>
                            <InputLabel>Sequence</InputLabel>
                            <TextField
                                name="sequence"
                                type="number"
                                value={formik.values.sequence}
                                onChange={formik.handleChange}
                                error={formik.touched.sequence && Boolean(formik.errors.sequence)}
                                helperText={formik.touched.sequence && formik.errors.sequence}
                                placeholder="Enter sequence"
                                fullWidth
                                disabled
                            />
                        </Stack>

                        <Stack sx={{ gap: 1 }}>
                            <InputLabel>Activity Type</InputLabel>
                            <FormControl fullWidth error={formik.touched.typeId && Boolean(formik.errors.typeId)}>
                                <Select
                                    name="typeId"
                                    value={formik.values.typeId}
                                    onChange={formik.handleChange}
                                    displayEmpty
                                >
                                    <MenuItem value="">Select Type</MenuItem>
                                    {activityTypes.map((type) => (
                                        <MenuItem key={type.id} value={type.id}>
                                            {type.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.typeId && formik.errors.typeId && (
                                    <FormHelperText>{formik.errors.typeId}</FormHelperText>
                                )}
                            </FormControl>
                        </Stack>

                        <Stack sx={{ gap: 1 }}>
                            <InputLabel>Activity Level</InputLabel>
                            <FormControl fullWidth error={formik.touched.levelId && Boolean(formik.errors.levelId)}>
                                <Select
                                    name="levelId"
                                    value={formik.values.levelId}
                                    onChange={formik.handleChange}
                                    displayEmpty
                                >
                                    <MenuItem value="">Select Level</MenuItem>
                                    {activityLevels.map((level) => (
                                        <MenuItem key={level.id} value={level.id}>
                                            {level.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {formik.touched.levelId && formik.errors.levelId && (
                                    <FormHelperText>{formik.errors.levelId}</FormHelperText>
                                )}
                            </FormControl>
                        </Stack>
                        <Stack sx={{ gap: 1 }}>
                            <InputLabel>Status</InputLabel>
                            <FormControl fullWidth error={formik.touched.status && Boolean(formik.errors.status)}>
                                <Select
                                    name="status"
                                    value={formik.values.status}
                                    onChange={formik.handleChange}
                                    displayEmpty
                                >
                                    <MenuItem value={1}>Active</MenuItem>
                                    <MenuItem value={2}>Inactive</MenuItem>
                                </Select>
                                {formik.touched.status && formik.errors.status && (
                                    <FormHelperText>{formik.errors.status}</FormHelperText>
                                )}
                            </FormControl>
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

ConstructionActivityFormDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    initialData: PropTypes.object
};