'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import {
    createPlanActivityConfigRequest,
    updatePlanActivityConfigRequest
} from 'store/constructionPlanActivityConfig/constructionPlanActivityConfigSlice';
import { IconButton } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';

export default function ActivityForm({ open, onClose, initialData = null, planConfigId }) {
    const dispatch = useDispatch();
    const { activities } = useSelector((state) => state.constructionActivity);

    const [form, setForm] = useState({
        constructionPlanConfigId: planConfigId,
        constructionActivityId: '',
        activityType: '',
        activityLevel: '',
        weightage: 0,
        imageCount: 0,
        videoCount: 0,
        status: 1
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                constructionPlanConfigId: initialData.constructionPlanConfigId,
                constructionActivityId: initialData.constructionActivityId || '',
                activityType: initialData.constructionActivity?.activityType?.name,
                activityLevel: initialData.constructionActivity?.activityLevel?.name,
                weightage: initialData.weightage || 0,
                imageCount: initialData.imageCount || 0,
                videoCount: initialData.videoCount || 0,
                status: initialData.status ?? 1
            });
        } else {
            setForm({
                constructionPlanConfigId: planConfigId,
                constructionActivityId: '',
                weightage: '',
                imageCount: '',
                videoCount: '',
                status: 1
            });
        }
    }, [initialData, open, planConfigId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (name === 'constructionActivityId') {
            const selectedActivity = activities.find((a) => a.id === value);
            if (selectedActivity) {
                setForm((prev) => ({
                    ...prev,
                    activityType: selectedActivity.activityType?.name || '',
                    activityLevel: selectedActivity.activityLevel?.name || ''
                }));
            }
        }
    };

    const handleSubmit = () => {
        if (initialData?.id) {
            dispatch(updatePlanActivityConfigRequest({ id: initialData.id, data: form }));
        } else {
            dispatch(createPlanActivityConfigRequest(form));
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {initialData ? 'Edit Construction Activity Configuration' : 'Add Construction Activity Configuration'}
                <IconButton onClick={onClose}>
                    <CloseOutlined />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <Stack sx={{ gap: 1 }}>
                        <InputLabel>Activity Name</InputLabel>
                        <Select
                            fullWidth
                            name="constructionActivityId"
                            value={form.constructionActivityId}
                            onChange={handleChange}
                            displayEmpty
                        >
                            {activities.map((act) => (
                                <MenuItem key={act.id} value={act.id}>
                                    {act.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Stack>

                    <Stack sx={{ gap: 1 }}>
                        <InputLabel>Activity Type</InputLabel>
                        <TextField
                            value={form.activityType || '-'}
                            fullWidth
                        />
                    </Stack>

                    <Stack sx={{ gap: 1 }}>
                        <InputLabel>Activity Level</InputLabel>
                        <TextField
                            value={form.activityLevel || '-'}
                            fullWidth
                        />
                    </Stack>

                    <Stack sx={{ gap: 1 }}>
                        <InputLabel>Weightage %</InputLabel>
                        <TextField
                            name="weightage"
                            value={form.weightage}
                            onChange={handleChange}
                            placeholder="Enter Weightage %"
                            fullWidth
                        />
                    </Stack>

                    <Stack direction="row" spacing={2}>
                        <Stack sx={{ gap: 1 }} flex={1}>
                            <InputLabel># Photos</InputLabel>
                            <TextField
                                name="imageCount"
                                value={form.imageCount}
                                onChange={handleChange}
                                placeholder="Enter Image Count"
                                fullWidth
                                type="number"
                            />
                        </Stack>

                        <Stack sx={{ gap: 1 }} flex={1}>
                            <InputLabel># Videos</InputLabel>
                            <TextField
                                name="videoCount"
                                value={form.videoCount}
                                onChange={handleChange}
                                placeholder="Enter Video Count"
                                fullWidth
                                type="number"
                            />
                        </Stack>
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

ActivityForm.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    initialData: PropTypes.object,
    planConfigId: PropTypes.string.isRequired
};