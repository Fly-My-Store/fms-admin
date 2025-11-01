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
    FormControlLabel,
    Checkbox,
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
import StateSelector from 'components/selector/StateSelector';
import DistrictSelector from 'components/selector/DistrictSelector';
import ZoneSelector from 'components/selector/ZoneSelector';
import CitySelector from 'components/selector/CitySelector';


const Filters = ({ filters, handleFilterChange }) => {
    return (
        <Stack direction="row" spacing={2} alignItems={'flex-end'} justifyContent={'right'} width={'100%'}>
            <Stack flex={1} spacing={1}>
                <InputLabel>{'City'}</InputLabel>
                <CitySelector
                    value={filters.city}
                    onChange={(value) => handleFilterChange('city', value)}
                />
            </Stack>
            <Stack flex={1} spacing={1}>
                <InputLabel>{'Zone'}</InputLabel>
                <ZoneSelector
                    value={filters.zone}
                    onChange={(value) => handleFilterChange('zone', value)}
                />
            </Stack>
            <Stack flex={1} spacing={1}>
                <InputLabel>{'District'}</InputLabel>
                <DistrictSelector
                    value={filters.district}
                    onChange={(value) => handleFilterChange('district', value)}
                />
            </Stack>
            <Stack flex={1} spacing={1}>
                <InputLabel>{'State'}</InputLabel>
                <StateSelector
                    value={filters.state}
                    onChange={(value) => handleFilterChange('state', value)}
                />
            </Stack>
            <FormControlLabel
                control={<Checkbox checked={filters.showBranches} onChange={e => handleFilterChange('showBranches', e.target.checked)} />}
                label="Show Branches"
            />
            <FormControlLabel
                control={<Checkbox checked={filters.showProperties} onChange={e => handleFilterChange('showProperties', e.target.checked)} />}
                label="Show Properties"
            />
        </Stack>
    );
};

export default Filters;