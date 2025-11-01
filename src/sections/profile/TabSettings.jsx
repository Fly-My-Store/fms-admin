import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';

// MUI Components
import {
  Stack,
  TextField,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  Typography
} from '@mui/material';

// Project Imports
import MainCard from 'components/MainCard';
import { enqueueSnackbar } from 'notistack';

// Redux Actions
import {
  fetchBusinessByIdRequest,
  upsertBusinessConfigRequest
} from 'store/business/businessSlice';

// ==============================|| TAB - SETTINGS ||============================== //

const validationSchema = yup.object({
  geoRestrictionRadius: yup
    .number()
    .min(0, 'Radius cannot be negative')
    .typeError('Enter a valid number')
    .required('Geo restriction radius is required'),
  canSubmitProgressNoPlan: yup.boolean(),
  progressSubmitNoPlanGapTime: yup
    .number()
    .min(0, 'Gap time must be >= 0')
    .typeError('Enter a valid number')
    .when('canSubmitProgressNoPlan', {
      is: true,
      then: (schema) => schema.required('Gap time is required when submission without plan is allowed')
    })
});

export default function TabSettings() {
  const dispatch = useDispatch();
  const { business } = useSelector((state) => state.business);
  const configuration = business?.businessConfiguration;

  const formik = useFormik({
    initialValues: {
      geoRestrictionRadius: '',
      canSubmitProgressNoPlan: false,
      progressSubmitNoPlanGapTime: ''
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(upsertBusinessConfigRequest(values));
      enqueueSnackbar('Configuration Updated', { variant: 'success' });
    },
    enableReinitialize: true
  });

  useEffect(() => {
    dispatch(fetchBusinessByIdRequest());
  }, [dispatch]);

  useEffect(() => {
    if (configuration) {
      formik.setValues({
        geoRestrictionRadius: configuration.geoRestrictionRadius || '',
        canSubmitProgressNoPlan: configuration.canSubmitProgressNoPlan || false,
        progressSubmitNoPlanGapTime: configuration.progressSubmitNoPlanGapTime || ''
      });
    }
  }, [configuration]);

  return (
    <MainCard title="Settings">
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={3} width="100%" maxWidth="500px">
          <div>
            <InputLabel>Geo Restriction Radius (in meters)</InputLabel>
            <TextField
              fullWidth
              id="geoRestrictionRadius"
              name="geoRestrictionRadius"
              type="number"
              value={formik.values.geoRestrictionRadius}
              onChange={formik.handleChange}
              error={formik.touched.geoRestrictionRadius && Boolean(formik.errors.geoRestrictionRadius)}
              helperText={formik.touched.geoRestrictionRadius && formik.errors.geoRestrictionRadius}
              placeholder="e.g., 100"
            />
          </div>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" color="secondary" onClick={() => formik.setValues({
              geoRestrictionRadius: configuration.geoRestrictionRadius || '',
              canSubmitProgressNoPlan: configuration.canSubmitProgressNoPlan || false,
              progressSubmitNoPlanGapTime: configuration.progressSubmitNoPlanGapTime || ''
            })}>
              Cancel
            </Button>
            <Button variant="contained" type="submit">
              Save
            </Button>
          </Stack>
        </Stack>
      </form>
    </MainCard>
  );
}