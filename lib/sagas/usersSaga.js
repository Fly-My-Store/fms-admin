import { call, put, takeLatest } from 'redux-saga/effects';
import { api } from '../api';
import { fetchUsers, setUsers, setUsersError } from '../slices/usersSlice';

function* usersWorker() {
  try {
    const { data } = yield call(api.get, '/admin/users');
    yield put(setUsers(data?.users || []));
  } catch (e) {
    yield put(setUsersError(e?.response?.data?.message || e.message));
  }
}

export default function* usersSaga() {
  yield takeLatest(fetchUsers.type, usersWorker);
}
