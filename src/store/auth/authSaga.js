import { call, put, takeLatest } from 'redux-saga/effects';
import { loginUser, forgotPassword, resetPassword, changePassword } from 'api/auth';
import { loginRequest, loginSuccess, loginFailure } from './authSlice';
import { forgotPasswordRequest, forgotPasswordSuccess, forgotPasswordFailure } from './authSlice';
import { resetPasswordRequest, resetPasswordSuccess, resetPasswordFailure } from './authSlice';
import { changePasswordRequest, changePasswordSuccess, changePasswordFailure } from './authSlice';

function* handleLogin(action) {
  try {
    const response = yield call(loginUser, action.payload.params);
    yield put(loginSuccess(response));
    if (action.payload.callback) action.payload.callback();
  } catch (err) {
    const errorMessage = err?.message || 'Login failed';
    yield put(loginFailure(errorMessage));
    if (action.payload.onError) action.payload.onError(errorMessage);
  }
}

function* handleForgotPassword(action) {
  try {
    const response = yield call(forgotPassword, action.payload.params);
    yield put(forgotPasswordSuccess(response));
    if (action.payload.callback) action.payload.callback();
  } catch (err) {
    const errorMessage = err?.message || 'Forgot password failed';
    yield put(forgotPasswordFailure(errorMessage));
    if (action.payload.onError) action.payload.onError(errorMessage);
  }
}
function* handleResetPassword(action) {
  try {
    const response = yield call(resetPassword, action.payload.params);
    yield put(resetPasswordSuccess(response));
    if (action.payload.callback) action.payload.callback();
  } catch (err) {
    const errorMessage = err?.message || 'Reset password failed';
    yield put(resetPasswordFailure(errorMessage));
    if (action.payload.onError) action.payload.onError(errorMessage);
  }
}
function* handleChangePassword(action) {
  try {
    const response = yield call(changePassword, action.payload.params);
    yield put(changePasswordSuccess(response));
    if (action.payload.callback) action.payload.callback();
  } catch (err) {
    const errorMessage = err?.response?.data?.message || err?.message || 'Change password failed';
    yield put(changePasswordFailure(errorMessage));
    if (action.payload.onError) action.payload.onError(errorMessage);
  }
}

export default function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(forgotPasswordRequest.type, handleForgotPassword);
  yield takeLatest(resetPasswordRequest.type, handleResetPassword);
  yield takeLatest(changePasswordRequest.type, handleChangePassword);
}
