import { call, put, takeLatest } from 'redux-saga/effects';
import { api } from '../api';
import { fetchVendors, setVendors, setVendorsError } from '../slices/vendorsSlice';

function* vendorsWorker() {
  try {
    const { data } = yield call(api.get, '/admin/vendors');
    yield put(setVendors(data?.vendors || []));
  } catch (e) {
    yield put(setVendorsError(e?.response?.data?.message || e.message));
  }
}

export default function* vendorsSaga() {
  yield takeLatest(fetchVendors.type, vendorsWorker);
}
