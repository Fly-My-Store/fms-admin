import { call, put, takeLatest, all } from 'redux-saga/effects';
import { getErrorMessage } from '../../utils/errors';
import { actions } from './slice';
import * as api from '../../api/geo';

function* pincodesListWorker(action) {
  try {
    const resp = yield call(api.listPincodes, action.payload?.params || {});
    yield put(actions.pincodesListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.pincodesListFailure(msg));
  }
}
function* pincodesGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getPincode, id);
    yield put(actions.pincodesGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.pincodesGetFailure(msg));
  }
}
function* pincodesCreateWorker(action) {
  try {
    const resp = yield call(api.createPincode, action.payload?.params);
    yield put(actions.pincodesCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.pincodesCreateFailure(msg));
  }
}
function* pincodesUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updatePincode, id, data);
    yield put(actions.pincodesUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.pincodesUpdateFailure(msg));
  }
}
function* pincodesRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.deletePincode, id);
    yield put(actions.pincodesRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.pincodesRemoveFailure(msg));
  }
}

function* addressesListWorker(action) {
  try {
    const resp = yield call(api.listAddresses, action.payload?.params || {});
    yield put(actions.addressesListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.addressesListFailure(msg));
  }
}
function* addressesGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getAddress, id);
    yield put(actions.addressesGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.addressesGetFailure(msg));
  }
}

export default function* geoSaga() {
  yield all([
    takeLatest(actions.pincodesListRequest.type, pincodesListWorker),
    takeLatest(actions.pincodesGetRequest.type, pincodesGetWorker),
    takeLatest(actions.pincodesCreateRequest.type, pincodesCreateWorker),
    takeLatest(actions.pincodesUpdateRequest.type, pincodesUpdateWorker),
    takeLatest(actions.pincodesRemoveRequest.type, pincodesRemoveWorker),
    takeLatest(actions.addressesListRequest.type, addressesListWorker),
    takeLatest(actions.addressesGetRequest.type, addressesGetWorker)
  ]);
}
