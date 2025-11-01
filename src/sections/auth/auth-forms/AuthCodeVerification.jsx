'use client';

import React, { useState } from 'react';
// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';
import OtpInput from 'react-otp-input';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import { useDispatch } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { forgotPasswordRequest, resetPasswordRequest } from 'store/auth/authSlice';
import { ROUTES } from 'utils/constants';
import { IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import useScriptRef from 'hooks/useScriptRef';
import { openSnackbar } from 'api/snackbar';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';

// ============================|| STATIC - CODE VERIFICATION ||============================ //

export default function AuthCodeVerification() {

  const dispatch = useDispatch();
  const router = useRouter();
  const scriptedRef = useScriptRef();
  const searchParams = useSearchParams();
  const encodedEmail = searchParams.get('email');
  const email = encodedEmail ? atob(encodedEmail) : '';
  const [capsWarning, setCapsWarning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const onKeyDown = (keyEvent) => {
    setCapsWarning(keyEvent.getModifierState('CapsLock'));
  };

  const handleResendCode = () => {
    if (!email) {
      openSnackbar({
        open: true,
        message: 'Email not found',
        variant: 'alert',
        alert: { color: 'error' }
      });
      return;
    }

    dispatch(
      forgotPasswordRequest({
        params: { email },
        callback: () => {
          openSnackbar({
            open: true,
            message: 'OTP resent successfully',
            variant: 'alert',
            alert: { color: 'success' }
          });
        },
        onError: () => {
          openSnackbar({
            open: true,
            message: 'Failed to resend OTP',
            variant: 'alert',
            alert: { color: 'error' }
          });
        }
      })
    );
  };

  const onSubmit = async (values, { setErrors, setStatus, setSubmitting }) => {
    try {
      dispatch(
        resetPasswordRequest({
          params: { email, otp: values.otp, password: values.password },
          callback: () => {
            openSnackbar({
              open: true,
              message: 'Check mail for reset password link',
              variant: 'alert',
              alert: { color: 'success' }
            });
            setTimeout(() => {
              router.push(ROUTES.LOGIN);
            }, 500);
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
      initialValues={{ otp: '', password: '' }}
      validationSchema={Yup.object({
        otp: Yup.string().length(6, 'OTP must be exactly 6 digits').required('OTP is required'),
        password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required')
      })}
      onSubmit={onSubmit}
    >
      {({ errors, handleSubmit, touched, values, setFieldValue, handleBlur, handleChange }) => (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Box
                sx={(theme) => ({
                  '& input': {
                    border: '1px solid',
                    borderColor: 'divider',
                    ...(touched.otp && errors.otp && { borderColor: 'error.main' }),
                    '&:focus-visible': {
                      outline: 'none !important',
                      borderColor: 'primary.main',
                      boxShadow: theme.customShadows.primary,
                      ...(touched.otp && errors.otp && { borderColor: 'error.main', boxShadow: theme.customShadows.error })
                    }
                  }
                })}
              >
                <OtpInput
                  value={values.otp}
                  onChange={(otp) => setFieldValue('otp', otp)}
                  inputType="tel"
                  shouldAutoFocus
                  renderInput={(props, index) => (
                    <input
                      {...props}
                      onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                          e.preventDefault();
                        } else if (e.key === 'Backspace' && !props.value) {
                          const previousInput = document.getElementById(`otp-input-${index - 1}`);
                          if (previousInput) {
                            previousInput.focus();
                          }
                        } else if (e.key !== 'Backspace') {
                          const nextInput = document.getElementById(`otp-input-${index + 1}`);
                          if (nextInput && props.value) {
                            setTimeout(() => {
                              nextInput.focus();
                            }, 0);
                          }
                        }
                        props.onKeyDown?.(e);
                      }}
                    />
                  )}
                  numInputs={6}
                  containerStyle={{ justifyContent: 'space-between', margin: -8 }}
                  inputStyle={{ width: '100%', margin: '8px', padding: '10px', outline: 'none', borderRadius: 4 }}
                />
                {touched.otp && errors.otp && (
                  <FormHelperText error id="standard-weight-helper-text-otp">
                    {errors.otp}
                  </FormHelperText>
                )}
              </Box>
            </Grid>
            <Grid size={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  fullWidth
                  color={capsWarning ? 'warning' : 'primary'}
                  error={Boolean(touched.password && errors.password)}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  name="password"
                  onBlur={(event) => {
                    setCapsWarning(false);
                    handleBlur(event);
                  }}
                  onKeyDown={onKeyDown}
                  onChange={handleChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        color="secondary"
                      >
                        {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </IconButton>
                    </InputAdornment>
                  }
                  placeholder="Enter password"
                />
                {capsWarning && (
                  <Typography variant="caption" sx={{ color: 'warning.main' }} id="warning-helper-text-password">
                    Caps lock on!
                  </Typography>
                )}
              </Stack>
              {touched.password && errors.password && (
                <FormHelperText error id="standard-weight-helper-text-password">
                  {errors.password}
                </FormHelperText>
              )}
            </Grid>
            <Grid size={12}>
              <AnimateButton>
                <Button disableElevation fullWidth size="large" type="submit" variant="contained">
                  Continue
                </Button>
              </AnimateButton>
            </Grid>
            <Grid size={12}>
              <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
                <Typography>Did not receive the email? Check your spam filter, or</Typography>
                <Typography
                  variant="body1"
                  sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                  color="primary"
                  onClick={handleResendCode}
                >
                  Resend
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}
