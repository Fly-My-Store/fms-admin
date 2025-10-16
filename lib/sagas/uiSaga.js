import { call, put, takeLatest } from 'redux-saga/effects';
import { api } from '../api';
import { fetchAdminStats, setAdminStats } from '../slices/uiSlice';

function* statsWorker() {
  try {
    const { data } = yield call(api.get, '/admin/stats');
    yield put(setAdminStats(data?.stats || { users: 0, vendors: 0, ordersToday: 0, gmvToday: 0 }));
  } catch (e) {
    yield put(setAdminStats({ users: 0, vendors: 0, ordersToday: 0, gmvToday: 0 }));
  }
}

export default function* uiSaga() {
  yield takeLatest(fetchAdminStats.type, statsWorker);
}
