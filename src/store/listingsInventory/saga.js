import { call, put, takeLatest, all } from 'redux-saga/effects';
import { getErrorMessage } from '../../utils/errors';
import { actions } from './slice';
import * as api from '../../api/listingsInventory';

function* storeProductsListWorker(action) {
  try {
    const resp = yield call(api.listStoreProducts, action.payload?.params || {});
    yield put(actions.storeProductsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.storeProductsListFailure(msg));
  }
}
function* storeProductsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getStoreProduct, id);
    yield put(actions.storeProductsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.storeProductsGetFailure(msg));
  }
}
function* storeProductsCreateWorker(action) {
  try {
    const resp = yield call(api.createStoreProduct, action.payload?.params);
    yield put(actions.storeProductsCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.storeProductsCreateFailure(msg));
  }
}
function* storeProductsUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateStoreProduct, id, data);
    yield put(actions.storeProductsUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.storeProductsUpdateFailure(msg));
  }
}
function* storeProductsRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.removeStoreProduct, id);
    yield put(actions.storeProductsRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.storeProductsRemoveFailure(msg));
  }
}

function* storeVariantsListWorker(action) {
  try {
    const resp = yield call(api.listStoreVariants, action.payload?.params || {});
    yield put(actions.storeVariantsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.storeVariantsListFailure(msg));
  }
}
function* storeVariantsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getStoreVariant, id);
    yield put(actions.storeVariantsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.storeVariantsGetFailure(msg));
  }
}
function* storeVariantsCreateWorker(action) {
  try {
    const resp = yield call(api.createStoreVariant, action.payload?.params);
    yield put(actions.storeVariantsCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.storeVariantsCreateFailure(msg));
  }
}
function* storeVariantsUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateStoreVariant, id, data);
    yield put(actions.storeVariantsUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.storeVariantsUpdateFailure(msg));
  }
}
function* storeVariantsRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.removeStoreVariant, id);
    yield put(actions.storeVariantsRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.storeVariantsRemoveFailure(msg));
  }
}

function* inventoryMovementsListWorker(action) {
  try {
    const resp = yield call(api.listInventoryMovements, action.payload?.params || {});
    yield put(actions.inventoryMovementsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.inventoryMovementsListFailure(msg));
  }
}
function* inventoryMovementsCreateWorker(action) {
  try {
    const resp = yield call(api.createInventoryMovement, action.payload?.params);
    yield put(actions.inventoryMovementsCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.inventoryMovementsCreateFailure(msg));
  }
}

export default function* listingsInventorySaga() {
  yield all([
    takeLatest(actions.storeProductsListRequest.type, storeProductsListWorker),
    takeLatest(actions.storeProductsGetRequest.type, storeProductsGetWorker),
    takeLatest(actions.storeProductsCreateRequest.type, storeProductsCreateWorker),
    takeLatest(actions.storeProductsUpdateRequest.type, storeProductsUpdateWorker),
    takeLatest(actions.storeProductsRemoveRequest.type, storeProductsRemoveWorker),
    takeLatest(actions.storeVariantsListRequest.type, storeVariantsListWorker),
    takeLatest(actions.storeVariantsGetRequest.type, storeVariantsGetWorker),
    takeLatest(actions.storeVariantsCreateRequest.type, storeVariantsCreateWorker),
    takeLatest(actions.storeVariantsUpdateRequest.type, storeVariantsUpdateWorker),
    takeLatest(actions.storeVariantsRemoveRequest.type, storeVariantsRemoveWorker),
    takeLatest(actions.inventoryMovementsListRequest.type, inventoryMovementsListWorker),
    takeLatest(actions.inventoryMovementsCreateRequest.type, inventoryMovementsCreateWorker)
  ]);
}
