'use client';

// next
import { useRouter } from 'next/navigation';

// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid2';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import useScriptRef from 'hooks/useScriptRef';
import AnimateButton from 'components/@extended/AnimateButton';

import { openSnackbar } from 'api/snackbar';
import { useDispatch } from 'react-redux';
import { forgotPasswordRequest } from 'store/auth/authSlice';
import { ROUTES } from 'utils/constants';

// ============================|| FORGOT PASSWORD ||============================ //

export default function AuthForgotPassword() {
  const scriptedRef = useScriptRef();
  const router = useRouter();
  const dispatch = useDispatch();

  const onSubmit = async (values, { setErrors, setStatus, setSubmitting }) => {
    try {
      dispatch(
        forgotPasswordRequest({
          params: { email: values.email },
          callback: () => {
            openSnackbar({
              open: true,
              message: 'Check mail for reset password link',
              variant: 'alert',
              alert: { color: 'success' }
            });
            setTimeout(() => {
              const encodedEmail = btoa(values.email);
              router.push(`${ROUTES.VERIFY_CODE}?email=${encodedEmail}`);
            }, 1500);
          },
          onError: (errMsg) => {
            setStatus({ success: false });
            setErrors({ submit: errMsg });
            setSubmitting(false);
          }
        })
      );
    } catch (err) {
      if (scriptedRef.current) {
        setStatus({ success: false });
        setErrors({ submit: err.message });
        setSubmitting(false);
      }
    }
  };

  return (
    <Formik
      initialValues={{
        email: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string().email('Must be a valid email').max(255).required('Email is required')
      })}
      onSubmit={onSubmit}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="email-forgot">Email Address</InputLabel>
                <OutlinedInput
                  fullWidth
                  error={Boolean(touched.email && errors.email)}
                  id="email-forgot"
                  type="email"
                  value={values.email}
                  name="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  inputProps={{}}
                />
              </Stack>
              {touched.email && errors.email && (
                <FormHelperText error id="helper-text-email-forgot">
                  {errors.email}
                </FormHelperText>
              )}
            </Grid>
            {errors.submit && (
              <Grid size={12}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Grid>
            )}
            <Grid sx={{ mb: -2 }} size={12}>
              <Typography variant="caption">Do not forgot to check SPAM box.</Typography>
            </Grid>
            <Grid size={12}>
              <AnimateButton>
                <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                  Send Password Reset Email
                </Button>
              </AnimateButton>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}
