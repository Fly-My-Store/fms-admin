import { call, put, takeLatest, all } from 'redux-saga/effects';
import { getErrorMessage } from '../../utils/errors';
import { actions } from './slice';
import * as api from '../../api/sellersStores';

function* sellersListWorker(action) {
  try {
    const resp = yield call(api.listSellers, action.payload?.params || {});
    yield put(actions.sellersListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.sellersListFailure(msg));
  }
}
function* sellersGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getSeller, id);
    yield put(actions.sellersGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.sellersGetFailure(msg));
  }
}
function* sellersCreateWorker(action) {
  try {
    const resp = yield call(api.createSeller, action.payload?.params);
    yield put(actions.sellersCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.sellersCreateFailure(msg));
  }
}
function* sellersUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateSeller, id, data);
    yield put(actions.sellersUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.sellersUpdateFailure(msg));
  }
}
function* sellersRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.removeSeller, id);
    yield put(actions.sellersRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.sellersRemoveFailure(msg));
  }
}

function* storesListWorker(action) {
  try {
    const resp = yield call(api.listStores, action.payload?.params || {});
    yield put(actions.storesListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.storesListFailure(msg));
  }
}
function* storesGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getStore, id);
    yield put(actions.storesGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.storesGetFailure(msg));
  }
}
function* storesCreateWorker(action) {
  try {
    const resp = yield call(api.createStore, action.payload?.params);
    yield put(actions.storesCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.storesCreateFailure(msg));
  }
}
function* storesUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateStore, id, data);
    yield put(actions.storesUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.storesUpdateFailure(msg));
  }
}
function* storesRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.removeStore, id);
    yield put(actions.storesRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.storesRemoveFailure(msg));
  }
}

export default function* sellersStoresSaga() {
  yield all([
    takeLatest(actions.sellersListRequest.type, sellersListWorker),
    takeLatest(actions.sellersGetRequest.type, sellersGetWorker),
    takeLatest(actions.sellersCreateRequest.type, sellersCreateWorker),
    takeLatest(actions.sellersUpdateRequest.type, sellersUpdateWorker),
    takeLatest(actions.sellersRemoveRequest.type, sellersRemoveWorker),
    takeLatest(actions.storesListRequest.type, storesListWorker),
    takeLatest(actions.storesGetRequest.type, storesGetWorker),
    takeLatest(actions.storesCreateRequest.type, storesCreateWorker),
    takeLatest(actions.storesUpdateRequest.type, storesUpdateWorker),
    takeLatest(actions.storesRemoveRequest.type, storesRemoveWorker)
  ]);
}
