import { call, put, takeLatest, all } from 'redux-saga/effects';
import { getErrorMessage } from '../../utils/errors';
import { actions } from './slice';
import * as api from '../../api/ordersPayments';

function* ordersListWorker(action) {
  try {
    const resp = yield call(api.listOrders, action.payload?.params || {});
    yield put(actions.ordersListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.ordersListFailure(msg));
  }
}
function* ordersGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getOrder, id);
    yield put(actions.ordersGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.ordersGetFailure(msg));
  }
}

function* ordersUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateOrder, id, data);
    yield put(actions.ordersUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.ordersUpdateFailure(msg));
  }
}

function* paymentsListWorker(action) {
  try {
    const resp = yield call(api.listPayments, action.payload?.params || {});
    yield put(actions.paymentsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.paymentsListFailure(msg));
  }
}
function* paymentsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getPayment, id);
    yield put(actions.paymentsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.paymentsGetFailure(msg));
  }
}
function* paymentsUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updatePayment, id, data);
    yield put(actions.paymentsUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.paymentsUpdateFailure(msg));
  }
}

function* refundsListWorker(action) {
  try {
    const resp = yield call(api.listRefunds, action.payload?.params || {});
    yield put(actions.refundsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.refundsListFailure(msg));
  }
}
function* refundsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getRefund, id);
    yield put(actions.refundsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.refundsGetFailure(msg));
  }
}
function* refundsCreateWorker(action) {
  try {
    const resp = yield call(api.createRefund, action.payload?.params);
    yield put(actions.refundsCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.refundsCreateFailure(msg));
  }
}
function* refundsUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateRefund, id, data);
    yield put(actions.refundsUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.refundsUpdateFailure(msg));
  }
}
export default function* ordersPaymentsSaga() {
  yield all([
    takeLatest(actions.ordersListRequest.type, ordersListWorker),
    takeLatest(actions.ordersGetRequest.type, ordersGetWorker),
    takeLatest(actions.ordersUpdateRequest.type, ordersUpdateWorker),
    takeLatest(actions.paymentsListRequest.type, paymentsListWorker),
    takeLatest(actions.paymentsGetRequest.type, paymentsGetWorker),
    takeLatest(actions.paymentsUpdateRequest.type, paymentsUpdateWorker),
    takeLatest(actions.refundsListRequest.type, refundsListWorker),
    takeLatest(actions.refundsGetRequest.type, refundsGetWorker),
    takeLatest(actions.refundsCreateRequest.type, refundsCreateWorker),
    takeLatest(actions.refundsUpdateRequest.type, refundsUpdateWorker)
  ]);
}
