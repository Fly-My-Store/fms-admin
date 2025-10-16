import { call, put, takeLatest } from 'redux-saga/effects';
import { api } from '../api';
import { hydrateFromStorage, hydrated, loginRequested, loginSucceeded, loginFailed, logout } from '../slices/authSlice';

function* hydrateWorker() {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const userRaw = typeof window !== 'undefined' ? localStorage.getItem('auth_user') : null;
    const user = userRaw ? JSON.parse(userRaw) : null;
    yield put(hydrated({ token, user }));
  } catch {}
}

function* loginWorker(action) {
  try {
    const { data } = yield call(api.post, '/auth/login', action.payload);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }
    yield put(loginSucceeded({ user: data.user, token: data.token }));
  } catch (e) {
    yield put(loginFailed(e?.response?.data?.message || e.message));
  }
}

function* logoutWorker() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}

export default function* authSaga() {
  yield takeLatest(hydrateFromStorage.type, hydrateWorker);
  yield takeLatest(loginRequested.type, loginWorker);
  yield takeLatest(logout.type, logoutWorker);
}
