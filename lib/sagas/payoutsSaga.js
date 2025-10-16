import { call, put, takeLatest } from 'redux-saga/effects';
import { api } from '../api';
import { fetchPayouts, setPayouts, setPayoutsError } from '../slices/payoutsSlice';

function* payoutsWorker() {
  try {
    const { data } = yield call(api.get, '/admin/payouts');
    yield put(setPayouts(data?.payouts || []));
  } catch (e) {
    yield put(setPayoutsError(e?.response?.data?.message || e.message));
  }
}

export default function* payoutsSaga() {
  yield takeLatest(fetchPayouts.type, payoutsWorker);
}
