import { call, put, takeLatest, all } from 'redux-saga/effects';
import { getErrorMessage } from '../../utils/errors';
import { actions } from './slice';
import * as api from '../../api/logistics';

function* deliveriesListWorker(action) {
  try {
    const resp = yield call(api.listDeliveries, action.payload?.params || {});
    yield put(actions.deliveriesListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.deliveriesListFailure(msg));
  }
}
function* deliveriesGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getDelivery, id);
    yield put(actions.deliveriesGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.deliveriesGetFailure(msg));
  }
}
function* deliveriesCreateWorker(action) {
  try {
    const resp = yield call(api.createDelivery, action.payload?.params);
    yield put(actions.deliveriesCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.deliveriesCreateFailure(msg));
  }
}
function* deliveriesUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateDelivery, id, data);
    yield put(actions.deliveriesUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.deliveriesUpdateFailure(msg));
  }
}

function* ridersListWorker(action) {
  try {
    const resp = yield call(api.listRiders, action.payload?.params || {});
    yield put(actions.ridersListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.ridersListFailure(msg));
  }
}
function* ridersGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getRider, id);
    yield put(actions.ridersGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.ridersGetFailure(msg));
  }
}
function* ridersCreateWorker(action) {
  try {
    const resp = yield call(api.createRider, action.payload?.params);
    yield put(actions.ridersCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.ridersCreateFailure(msg));
  }
}
function* ridersUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateRider, id, data);
    yield put(actions.ridersUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.ridersUpdateFailure(msg));
  }
}
export default function* logisticsSaga() {
  yield all([
    takeLatest(actions.deliveriesListRequest.type, deliveriesListWorker),
    takeLatest(actions.deliveriesGetRequest.type, deliveriesGetWorker),
    takeLatest(actions.deliveriesCreateRequest.type, deliveriesCreateWorker),
    takeLatest(actions.deliveriesUpdateRequest.type, deliveriesUpdateWorker),
    takeLatest(actions.ridersListRequest.type, ridersListWorker),
    takeLatest(actions.ridersGetRequest.type, ridersGetWorker),
    takeLatest(actions.ridersCreateRequest.type, ridersCreateWorker),
    takeLatest(actions.ridersUpdateRequest.type, ridersUpdateWorker)
  ]);
}
