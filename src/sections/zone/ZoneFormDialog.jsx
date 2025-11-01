'use client';

import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormHelperText from '@mui/material/FormHelperText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { CloseOutlined } from '@ant-design/icons';

import { createZoneRequest, updateZoneRequest } from 'store/location/locationSlice';

const validationSchema = Yup.object({
  name: Yup.string().required('Zone name is required'),
  code: Yup.string().required('Zone code is required'),
  status: Yup.number().required('Status is required').oneOf([1, 2], 'Invalid status')
});

const ZoneFormDialog = ({ open, onClose, initialData = null }) => {
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      name: '',
      code: '',
      status: 1
    },
    validationSchema,
    onSubmit: (values) => {
      const data = { ...values, status: Number(values.status) };
      if (initialData?.id) {
        dispatch(updateZoneRequest({ id: initialData.id, data }));
      } else {
        dispatch(createZoneRequest(data));
      }
      onClose();
    },
    enableReinitialize: true
  });

  useEffect(() => {
    if (initialData) {
      formik.setValues({
        name: initialData.name || '',
        code: initialData.code || '',
        status: initialData.status ?? 1
      });
    } else {
      formik.resetForm();
    }
  }, [initialData, open]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {initialData ? 'Edit Zone' : 'Add Zone'}
        <IconButton onClick={onClose}><CloseOutlined /></IconButton>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={3} width={'400px'}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Zone Name</InputLabel>
              <TextField
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Zone Name"
                error={formik.touched.name && Boolean(formik.errors.name)}
                fullWidth
              />
              {formik.touched.name && formik.errors.name && (
                <FormHelperText error>{formik.errors.name}</FormHelperText>
              )}
            </Stack>

            <Stack sx={{ gap: 1 }}>
              <InputLabel>Zone Code</InputLabel>
              <TextField
                name="code"
                value={formik.values.code}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter Zone Code"
                error={formik.touched.code && Boolean(formik.errors.code)}
                fullWidth
              />
              {formik.touched.code && formik.errors.code && (
                <FormHelperText error>{formik.errors.code}</FormHelperText>
              )}
            </Stack>

            <Stack sx={{ gap: 1 }}>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                fullWidth
              >
                <MenuItem value={1}>Active</MenuItem>
                <MenuItem value={2}>Inactive</MenuItem>
              </Select>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" type="submit">
            {initialData ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

ZoneFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};

export default ZoneFormDialog;