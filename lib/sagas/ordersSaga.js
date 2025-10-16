import { call, put, takeLatest } from 'redux-saga/effects';
import { api } from '../api';
import { fetchOrders, setOrders, setOrdersError } from '../slices/ordersSlice';

function* ordersWorker() {
  try {
    const { data } = yield call(api.get, '/admin/orders');
    yield put(setOrders(data?.orders || []));
  } catch (e) {
    yield put(setOrdersError(e?.response?.data?.message || e.message));
  }
}

export default function* ordersSaga() {
  yield takeLatest(fetchOrders.type, ordersWorker);
}
