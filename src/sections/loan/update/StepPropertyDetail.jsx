'use client';

import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import { useEffect } from 'react';
import * as yup from 'yup';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import AnimateButton from 'components/@extended/AnimateButton';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStructureTypesRequest } from 'store/loan/loanSlice';
import { Checkbox, IconButton, ListItemText, Tooltip } from '@mui/material';
import { InfoCircleFilled } from '@ant-design/icons';

const STATES = ['Rajasthan', 'Maharashtra', 'Delhi', 'Gujarat', 'Karnataka'];
const FLOOR_OPTIONS = Array.from({ length: 5 }, (_, i) => i + 1);
const BASEMENT_OPTIONS = Array.from({ length: 3 }, (_, i) => i);

const validationSchema = yup.object({
    name: yup.string().required('Property Name is required'),
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    landArea: yup.number().typeError('Must be a number').required('Land Area is required'),
    builtUpArea: yup.number().typeError('Must be a number').required('Built-up Area is required'),
    floors: yup.number().required('Floors is required'),
    basements: yup.number().required('Basement is required'),
    structureTypeId: yup.string().required('Structure Type is required'),
    district: yup.string().required('District is required'),
    pincode: yup.string().required('Pincodeis required'),
    lat: yup.number().required('Latitude is required'),
    lng: yup.number().required('Longitude is required')
});

export default function StepPropertyDetail({
    handleBack,
    propertyFormData,
    handlePropertyDetail,
    setErrorIndex
}) {
    const dispatch = useDispatch();
    const { structureTypes } = useSelector((state) => state.loan);

    useEffect(() => {
        dispatch(fetchStructureTypesRequest({ active: true }));
    }, [dispatch]);

    const formik = useFormik({
        initialValues: {
            name: '',
            address: '',
            city: '',
            state: '',
            landArea: '',
            builtUpArea: '',
            floors: '',
            basements: '',
            residentialFloors: '',
            structureTypeId: '',
            district: '',
            pincode: '',
            lat: '',
            lng: '',
            isGroundFloorNonResidential: false,
        },
        validationSchema,
        onSubmit: (values) => {
            handlePropertyDetail(values);
        },
        enableReinitialize: true
    });
    useEffect(() => {
        if (propertyFormData) {
            formik.setValues({
                name: propertyFormData?.name ?? '',
                address: propertyFormData?.address ?? '',
                city: propertyFormData?.city ?? '',
                state: propertyFormData?.state ?? '',
                landArea: propertyFormData?.landArea ?? '',
                builtUpArea: propertyFormData?.builtUpArea ?? '',
                floors: propertyFormData?.floors ?? '',
                basements: propertyFormData?.basements ?? '',
                residentialFloors: propertyFormData?.residentialFloors ?? '',
                structureTypeId: propertyFormData?.structureTypeId ?? '',
                district: propertyFormData?.district ?? '',
                pincode: propertyFormData?.pincode ?? '',
                lat: propertyFormData?.lat ?? '',
                lng: propertyFormData?.lng ?? '',
                isGroundFloorNonResidential: (propertyFormData?.floors - propertyFormData?.residentialFloors) === 1
            });
        } else {
            formik.resetForm();
        }
    }, [propertyFormData]);

    return (
        <>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                Property Details
            </Typography>
            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={3}>
                    <Stack direction="row" spacing={3}>
                        <Stack flex={1} spacing={3}>
                            <Stack spacing={1}>
                                <InputLabel>Property Name</InputLabel>
                                <TextField
                                    id="name"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    placeholder="Enter Property Name"
                                    fullWidth
                                />
                            </Stack>

                            <Stack spacing={1}>
                                <InputLabel>Address</InputLabel>
                                <TextField
                                    id="address"
                                    name="address"
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    error={formik.touched.address && Boolean(formik.errors.address)}
                                    placeholder="Enter Address"
                                    fullWidth
                                    multiline
                                    rows={5}
                                />
                            </Stack>

                            <Stack direction={'row'} spacing={3}>
                                <Stack flex={1} spacing={1}>
                                    <InputLabel>Structure Type</InputLabel>
                                    <Select
                                        name="structureTypeId"
                                        value={formik.values.structureTypeId}
                                        onChange={formik.handleChange}
                                        error={formik.touched.structureTypeId && Boolean(formik.errors.structureTypeId)}
                                        fullWidth
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>Select Structure Type</MenuItem>
                                        {structureTypes.map((type) => (
                                            <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                                        ))}
                                    </Select>
                                </Stack>
                                <Stack flex={1} spacing={1}>
                                    <InputLabel>Land Area (sq.ft)</InputLabel>
                                    <TextField
                                        type="number"
                                        name="landArea"
                                        value={formik.values.landArea}
                                        onChange={formik.handleChange}
                                        error={formik.touched.landArea && Boolean(formik.errors.landArea)}
                                        placeholder="Enter Land Area"
                                        fullWidth
                                    />
                                </Stack>
                                <Stack flex={1} spacing={1}>
                                    <InputLabel>Built-up Area (sq.ft)</InputLabel>
                                    <TextField
                                        type="number"
                                        name="builtUpArea"
                                        value={formik.values.builtUpArea}
                                        onChange={formik.handleChange}
                                        error={formik.touched.builtUpArea && Boolean(formik.errors.builtUpArea)}
                                        placeholder="Enter Built-up Area"
                                        fullWidth
                                    />
                                </Stack>
                            </Stack>
                            <Stack direction={'row'} spacing={3}>
                                <Stack flex={1}>
                                    <Stack direction={'row'} alignItems={'center'} justifyContent={'flex-start'}>
                                        <Tooltip title="Check if the ground floor is used for non residential purpose - Parking, Storage, Godown, Warehouse, Open Area etc.">
                                            <IconButton color='warning'>
                                                <InfoCircleFilled style={{ cursor: 'pointer' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Typography>Is ground floor non residential?</Typography>
                                        <Checkbox
                                            id="isGroundFloorNonResidential"
                                            checked={formik.values.isGroundFloorNonResidential}
                                            onChange={formik.handleChange}
                                        />
                                    </Stack>
                                </Stack>
                            </Stack>

                        </Stack>

                        <Stack flex={1} spacing={3}>
                            <Stack direction={'row'} spacing={3}>
                                <Stack flex={1} spacing={1}>
                                    <InputLabel>City</InputLabel>
                                    <TextField
                                        id="city"
                                        name="city"
                                        value={formik.values.city}
                                        onChange={formik.handleChange}
                                        error={formik.touched.city && Boolean(formik.errors.city)}
                                        placeholder="Enter City"
                                        fullWidth
                                        disabled
                                    />
                                </Stack>
                                <Stack flex={1} spacing={1}>
                                    <InputLabel>State</InputLabel>
                                    <TextField
                                        id="state"
                                        name="state"
                                        value={formik.values.state}
                                        onChange={formik.handleChange}
                                        error={formik.touched.state && Boolean(formik.errors.state)}
                                        placeholder="Enter State"
                                        fullWidth
                                        disabled
                                    />
                                </Stack>
                            </Stack>
                            <Stack direction={'row'} spacing={3}>
                                <Stack flex={1} spacing={1}>
                                    <InputLabel>District</InputLabel>
                                    <TextField
                                        id="district"
                                        name="district"
                                        value={formik.values.district}
                                        onChange={formik.handleChange}
                                        error={formik.touched.district && Boolean(formik.errors.district)}
                                        placeholder="Enter District"
                                        fullWidth
                                        disabled
                                    />
                                </Stack>
                                <Stack flex={1} spacing={1}>
                                    <InputLabel>Pincode</InputLabel>
                                    <TextField
                                        id="pincode"
                                        name="pincode"
                                        value={formik.values.pincode}
                                        onChange={formik.handleChange}
                                        error={formik.touched.pincode && Boolean(formik.errors.pincode)}
                                        placeholder="Enter Pincode"
                                        fullWidth
                                    />
                                </Stack>
                            </Stack>
                            <Stack direction={'row'} spacing={3}>
                                <Stack flex={1} spacing={1}>
                                    <InputLabel>Latitude</InputLabel>
                                    <TextField
                                        type="number"
                                        name="lat"
                                        value={formik.values.lat}
                                        onChange={formik.handleChange}
                                        error={formik.touched.lat && Boolean(formik.errors.lat)}
                                        placeholder="Latitude"
                                        fullWidth
                                    />
                                </Stack>

                                <Stack flex={1} spacing={1}>
                                    <InputLabel>Longitude</InputLabel>
                                    <TextField
                                        type="number"
                                        name="lng"
                                        value={formik.values.lng}
                                        onChange={formik.handleChange}
                                        error={formik.touched.lng && Boolean(formik.errors.lng)}
                                        placeholder="Longitude"
                                        fullWidth
                                    />
                                </Stack>
                            </Stack>
                            <Stack direction={'row'} spacing={3}>
                                <Stack flex={1} spacing={1}>
                                    <InputLabel>Floors</InputLabel>
                                    <Select
                                        name="floors"
                                        value={formik.values.floors}
                                        onChange={formik.handleChange}
                                        error={formik.touched.floors && Boolean(formik.errors.floors)}
                                        fullWidth
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>Select Floors</MenuItem>
                                        {FLOOR_OPTIONS.map((val) => (
                                            <MenuItem key={val} value={val}>{val}</MenuItem>
                                        ))}
                                    </Select>
                                </Stack>

                                <Stack flex={1} spacing={1}>
                                    <InputLabel>Basement</InputLabel>
                                    <Select
                                        name="basements"
                                        value={formik.values.basements}
                                        onChange={formik.handleChange}
                                        error={formik.touched.basements && Boolean(formik.errors.basements)}
                                        fullWidth
                                        displayEmpty
                                    >
                                        <MenuItem value="" disabled>Select Basement Floors</MenuItem>
                                        {BASEMENT_OPTIONS.map((val) => (
                                            <MenuItem key={val} value={val}>{val}</MenuItem>
                                        ))}
                                    </Select>
                                </Stack>
                            </Stack>


                        </Stack>
                    </Stack>

                    <Stack direction="row" justifyContent='space-between' width={'100%'}>
                        <Button variant="outlined" onClick={handleBack}>
                            Back
                        </Button>
                        <Button variant="contained" type="submit" onClick={() => setErrorIndex(2)}>
                            Next
                        </Button>
                    </Stack>
                </Stack>
            </form>
        </>
    );
}

StepPropertyDetail.propTypes = {
    handleBack: PropTypes.func,
    handlePropertyDetail: PropTypes.func,
    setErrorIndex: PropTypes.func
};