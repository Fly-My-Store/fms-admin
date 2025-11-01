'use client';

import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    InputLabel,
    IconButton,
    FormHelperText,
    MenuItem,
    Select,
    Autocomplete,
    Typography,
    FormControl,
} from '@mui/material';
import Grid from '@mui/material/Grid2'
import { CloseOutlined } from '@ant-design/icons';

import {
    fetchStatesRequest,
    fetchDistrictsRequest,
    fetchCitiesRequest,
    fetchZonesRequest
} from 'store/location/locationSlice';
import MainCard from 'components/MainCard';
import CountAnalytics from 'components/cards/CountAnalytics';
import { DebouncedInput } from 'components/third-party/react-table';


const BranchFilters = ({ handleAddButton, filters, handleFilterChange }) => {
    const dispatch = useDispatch();

    const { states, districts, cities, zones, branches } = useSelector((state) => state.location);

    useEffect(() => {
        dispatch(fetchStatesRequest({ page: 1, limit: 500 }));
        dispatch(fetchDistrictsRequest({ page: 1, limit: 500 }));
        dispatch(fetchCitiesRequest({ page: 1, limit: 500 }));
        dispatch(fetchZonesRequest({ page: 1, limit: 500 }));
    }, [dispatch]);

    return (
        <Stack direction="row" spacing={2} justifyContent={'right'} mb={2}>
            <DebouncedInput
                value={filters.search}
                onFilterChange={(text) => handleFilterChange('search', text)}
                placeholder="Search Branches..."
                debounce={500}
                size="small"
            />
            <FormControl size='small' sx={{ minWidth: 140 }}>
                <InputLabel sx={{ marginTop: '4px' }}>State</InputLabel>
                <Select
                    value={filters.stateId}
                    label="State"
                    onChange={(e) => handleFilterChange('stateId', e.target.value)}
                >
                    <MenuItem value="">All</MenuItem>
                    {states.data?.map((item) => (
                        <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size='small' sx={{ minWidth: 140 }}>
                <InputLabel sx={{ marginTop: '4px' }}>District</InputLabel>
                <Select
                    value={filters.districtId}
                    label="District"
                    onChange={(e) => handleFilterChange('districtId', e.target.value)}
                >
                    <MenuItem value="">All</MenuItem>
                    {districts.data?.map((item) => (
                        <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size='small' sx={{ minWidth: 140 }}>
                <InputLabel sx={{ marginTop: '4px' }}>City</InputLabel>
                <Select
                    value={filters.cityId}
                    label="City"
                    onChange={(e) => handleFilterChange('cityId', e.target.value)}
                >
                    <MenuItem value="">All</MenuItem>
                    {cities.data?.map((item) => (
                        <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size='small' sx={{ minWidth: 140 }}>
                <InputLabel sx={{ marginTop: '4px' }}>Zone</InputLabel>
                <Select
                    value={filters.zoneId}
                    label="Zone"
                    onChange={(e) => handleFilterChange('zoneId', e.target.value)}
                >
                    <MenuItem value="">All</MenuItem>
                    {zones.data?.map((item) => (
                        <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Button
                variant={'contained'}
                size="small"
                onClick={handleAddButton}
            >
                {'Add Branch'}
            </Button>
        </Stack>
    );
};

export default BranchFilters;