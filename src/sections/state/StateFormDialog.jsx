'use client';

import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
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
  Select,
  MenuItem
} from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';

import {
  createStateRequest,
  updateStateRequest
} from 'store/location/locationSlice';

const validationSchema = Yup.object({
  name: Yup.string().required('State name is required'),
  code: Yup.string().required('State code is required'),
  status: Yup.number().required('Status is required').oneOf([1, 2], 'Invalid status')
});

const StateFormDialog = ({ open, onClose, initialData = null }) => {
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      name: '',
      code: '',
      status: 1
    },
    validationSchema,
    onSubmit: (values) => {
      if (initialData?.id) {
        dispatch(updateStateRequest({ id: initialData.id, data: values }));
      } else {
        dispatch(createStateRequest(values));
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
        {initialData ? 'Edit State' : 'Add State'}
        <IconButton onClick={onClose}>
          <CloseOutlined />
        </IconButton>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Stack spacing={3} width={'400px'}>
            {/* Name Field */}
            <Stack sx={{ gap: 1 }}>
              <InputLabel>State Name</InputLabel>
              <TextField
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                placeholder="Enter state name"
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
              {formik.touched.name && formik.errors.name && (
                <FormHelperText error>{formik.errors.name}</FormHelperText>
              )}
            </Stack>

            {/* Code Field */}
            <Stack sx={{ gap: 1 }}>
              <InputLabel>Code</InputLabel>
              <TextField
                name="code"
                value={formik.values.code}
                onChange={formik.handleChange}
                placeholder="Enter code"
                error={formik.touched.code && Boolean(formik.errors.code)}
              />
              {formik.touched.code && formik.errors.code && (
                <FormHelperText error>{formik.errors.code}</FormHelperText>
              )}
            </Stack>

            {/* Status Field */}
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

StateFormDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  initialData: PropTypes.object
};

export default StateFormDialog;