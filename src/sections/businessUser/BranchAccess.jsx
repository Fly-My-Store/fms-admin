'use client';

import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import { Box } from '@mui/system';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBranchesRequest } from 'store/location/locationSlice';


const accessLevels = ['code', 'city', 'district', 'zone', 'state'];

export default function BranchAccessStep({ branchAccessDisabled, accessData, setAccessData, handleSubmit, setErrorIndex, handleBack }) {

    const dispatch = useDispatch();
    const { data } = useSelector((state) => state.location.branches);

    const initialLevel = Array.isArray(accessData) && accessData.length > 0 ? accessData[0].accessLevel : '';

    const initialSelectedValues = (() => {
        if (!accessData || accessData.length === 0) return [];
        if (initialLevel === 'code') {
            return accessData
                .map((item) =>
                    data.find((b) => b.id === item.branchId)
                )
                .filter(Boolean)
                .map((b) => ({ id: b.id, label: b.code }));
        } else {
            return accessData.map((item) => item.accessValue);
        }
    })();
    const [selectedLevel, setSelectedLevel] = useState(initialLevel);
    const [selectedValues, setSelectedValues] = useState(initialSelectedValues);

    useEffect(() => {
        dispatch(fetchBranchesRequest());
    }, [dispatch]);

    const getOptions = () => {
        switch (selectedLevel) {
            case 'code':
                return data.map((b) => ({ id: b.id, label: b.code }));
            case 'city':
                return data.map((b) => ({ id: b.cityId, label: b.city }));
            case 'district':
                return data.map((b) => ({ id: b.districtId, label: b.district }));
            case 'zone':
                return data.map((b) => ({ id: b.zoneId, label: b.zone }));
            case 'state':
                return data.map((b) => ({ id: b.stateId, label: b.state }));
            default:
                return [];
        }
    };

    const onClickListener = () => {
        if (selectedLevel && selectedValues.length > 0) {
            const updatedData = selectedValues.map((item) => {
                return { accessLevel: selectedLevel, branchId: item.id, accessValue: item.label };
            });
            setAccessData(updatedData);
            handleSubmit(updatedData);
        } else {
            setErrorIndex(1);
        }
    };

    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Branch Access
            </Typography>
            <Stack spacing={3}>
                <Stack spacing={3} direction={'row'}>
                    <Stack spacing={3} flex={1} >
                        <Stack spacing={1}  >
                            <InputLabel>Access Type</InputLabel>
                            <Select
                                value={selectedLevel}
                                onChange={(e) => {
                                    setSelectedLevel(e.target.value);
                                    setSelectedValues([]);
                                }}
                                displayEmpty
                                disabled={branchAccessDisabled}
                            >
                                <MenuItem value="" disabled>Select access level</MenuItem>
                                {accessLevels.map((level) => (
                                    <MenuItem key={level} value={level}>
                                        {level.toUpperCase()}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Stack>

                        {selectedLevel && (
                            <Stack spacing={1} >
                                <InputLabel>Select Values</InputLabel>
                                <Autocomplete
                                    multiple
                                    value={selectedValues}
                                    options={getOptions()}
                                    getOptionLabel={(option) =>
                                        selectedLevel === 'code' ? option.label : option
                                    }
                                    isOptionEqualToValue={(option, value) =>
                                        selectedLevel === 'code' ? option.id === value.id : option === value
                                    }
                                    onChange={(e, values) => setSelectedValues(values)}
                                    renderInput={(params) => <TextField {...params} placeholder="Select multiple" />}
                                />
                            </Stack>
                        )}
                    </Stack>

                    <Stack spacing={1} flex={1}>
                        <Typography variant="subtitle2">Assigned Access</Typography>
                        <Box
                            display="flex"
                            flexWrap="wrap"
                            gap={1}
                            alignItems="center"
                        >
                            {selectedValues.map((val, i) => (
                                <Chip
                                    key={i}
                                    label={selectedLevel === 'code' ? val.label : val}
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Stack>
                </Stack>
                <Stack direction="row" justifyContent='space-between' width={'100%'}>
                    <Button onClick={handleBack}>Back</Button>
                    <AnimateButton>
                        <Button variant="contained" onClick={onClickListener}>
                            Submit
                        </Button>
                    </AnimateButton>
                </Stack>
            </Stack>
        </>
    );
}

BranchAccessStep.propTypes = {
    accessData: PropTypes.array.isRequired,
    setAccessData: PropTypes.func.isRequired,
    handleNext: PropTypes.func.isRequired,
    setErrorIndex: PropTypes.func
};