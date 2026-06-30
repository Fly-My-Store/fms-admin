import { call, put, takeLatest, all } from 'redux-saga/effects';
import { getErrorMessage } from '../../utils/errors';
import { actions } from './slice';
import * as api from '../../api/attributes';

function* defsListWorker(action) {
  try {
    const resp = yield call(api.listDefs, action.payload?.params || {});
    yield put(actions.defsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.defsListFailure(msg));
  }
}
function* defsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getDef, id);
    yield put(actions.defsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.defsGetFailure(msg));
  }
}
function* defsCreateWorker(action) {
  try {
    const resp = yield call(api.createDef, action.payload?.params);
    yield put(actions.defsCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.defsCreateFailure(msg));
  }
}
function* defsUpdateWorker(action) {
  try {
    const { code, data } = action.payload?.params || {};
    const resp = yield call(api.updateDef, code, data);
    yield put(actions.defsUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.defsUpdateFailure(msg));
  }
}
function* defsRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.removeDef, id);
    yield put(actions.defsRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.defsRemoveFailure(msg));
  }
}

function* groupsListWorker(action) {
  try {
    const resp = yield call(api.listGroups, action.payload?.params || {});
    yield put(actions.groupsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.groupsListFailure(msg));
  }
}
function* groupsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getGroup, id);
    yield put(actions.groupsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.groupsGetFailure(msg));
  }
}
function* groupsCreateWorker(action) {
  try {
    const resp = yield call(api.createGroup, action.payload?.params);
    yield put(actions.groupsCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.groupsCreateFailure(msg));
  }
}
function* groupsUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateGroup, id, data);
    yield put(actions.groupsUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.groupsUpdateFailure(msg));
  }
}
function* groupsRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.removeGroup, id);
    yield put(actions.groupsRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.groupsRemoveFailure(msg));
  }
}

function* categoryAttrsListWorker(action) {
  try {
    const resp = yield call(api.listCategoryAttrs, action.payload?.params || {});
    yield put(actions.categoryAttrsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.categoryAttrsListFailure(msg));
  }
}
function* categoryAttrsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getCategoryAttr, id);
    yield put(actions.categoryAttrsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.categoryAttrsGetFailure(msg));
  }
}
function* categoryAttrsCreateWorker(action) {
  try {
    const params = action.payload?.params || {};
    const resp = yield call(api.createCategoryAttr, params);
    yield put(actions.categoryAttrsCreateSuccess(resp));
    if (params.category_id) {
      yield put(actions.categoryAttrsListRequest({
        params: { category_id: params.category_id, page: 1, limit: 100 },
      }));
    }
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.categoryAttrsCreateFailure(msg));
  }
}
function* categoryAttrsUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateCategoryAttr, id, data);
    yield put(actions.categoryAttrsUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.categoryAttrsUpdateFailure(msg));
  }
}
function* categoryAttrsRemoveWorker(action) {
  try {
    const { category_id, attribute_code } = action.payload?.params || {};
    yield call(api.removeCategoryAttr, category_id, attribute_code);
    yield put(actions.categoryAttrsRemoveSuccess({ attribute_code }));
    if (category_id) {
      yield put(actions.categoryAttrsListRequest({
        params: { category_id, page: 1, limit: 100 },
      }));
    }
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.categoryAttrsRemoveFailure(msg));
  }
}

function* plpConfigsListWorker(action) {
  try {
    const resp = yield call(api.listPlpConfigs, action.payload?.params || {});
    yield put(actions.plpConfigsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.plpConfigsListFailure(msg));
  }
}
function* plpConfigsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getPlpConfig, id);
    yield put(actions.plpConfigsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.plpConfigsGetFailure(msg));
  }
}
function* plpConfigsCreateWorker(action) {
  try {
    const resp = yield call(api.createPlpConfig, action.payload?.params);
    yield put(actions.plpConfigsCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.plpConfigsCreateFailure(msg));
  }
}
function* plpConfigsUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.upsertPlpConfig, id, data);
    yield put(actions.plpConfigsUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.plpConfigsUpdateFailure(msg));
  }
}
function* plpConfigsRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.removePlpConfig, id);
    yield put(actions.plpConfigsRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.plpConfigsRemoveFailure(msg));
  }
}

function* listProductAttrsWorker(action) {
  try {
    const data = action.payload?.params || {};
    const resp = yield call(api.listProductAttrs, data);
    yield put(actions.productAttrsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.productAttrsListFailure(msg));
  }
}

function* upsertProductAttrWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.upsertProductAttr, id);
    yield put(actions.productAttrUpsertSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.productAttrUpsertFailure(msg));
  }
}

function* productAttrGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getProductAttr, id);
    yield put(actions.productAttrGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.productAttrGetFailure(msg));
  }
}

function* listVariantAttrsWorker(action) {
  try {
    const data = action.payload?.params || {};
    const resp = yield call(api.listVariantAttrs, data);
    yield put(actions.variantAttrsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.variantAttrsListFailure(msg));
  }
}

function* upsertVariantAttrWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.upsertVariantAttr, id);
    yield put(actions.variantAttrUpsertSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.variantAttrUpsertFailure(msg));
  }
}

function* variantAttrGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getVariantAttr, id);
    yield put(actions.variantAttrGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.variantAttrGetFailure(msg));
  }
}

export default function* attributesSaga() {
  yield all([
    takeLatest(actions.defsListRequest.type, defsListWorker),
    takeLatest(actions.defsGetRequest.type, defsGetWorker),
    takeLatest(actions.defsCreateRequest.type, defsCreateWorker),
    takeLatest(actions.defsUpdateRequest.type, defsUpdateWorker),
    takeLatest(actions.defsRemoveRequest.type, defsRemoveWorker),
    takeLatest(actions.groupsListRequest.type, groupsListWorker),
    takeLatest(actions.groupsGetRequest.type, groupsGetWorker),
    takeLatest(actions.groupsCreateRequest.type, groupsCreateWorker),
    takeLatest(actions.groupsUpdateRequest.type, groupsUpdateWorker),
    takeLatest(actions.groupsRemoveRequest.type, groupsRemoveWorker),
    takeLatest(actions.categoryAttrsListRequest.type, categoryAttrsListWorker),
    takeLatest(actions.categoryAttrsGetRequest.type, categoryAttrsGetWorker),
    takeLatest(actions.categoryAttrsCreateRequest.type, categoryAttrsCreateWorker),
    takeLatest(actions.categoryAttrsUpdateRequest.type, categoryAttrsUpdateWorker),
    takeLatest(actions.categoryAttrsRemoveRequest.type, categoryAttrsRemoveWorker),
    takeLatest(actions.plpConfigsListRequest.type, plpConfigsListWorker),
    takeLatest(actions.plpConfigsGetRequest.type, plpConfigsGetWorker),
    takeLatest(actions.plpConfigsCreateRequest.type, plpConfigsCreateWorker),
    takeLatest(actions.plpConfigsUpdateRequest.type, plpConfigsUpdateWorker),
    takeLatest(actions.plpConfigsRemoveRequest.type, plpConfigsRemoveWorker),

    takeLatest(actions.productAttrsListRequest.type, listProductAttrsWorker),
    takeLatest(actions.productAttrUpsertRequest.type, upsertProductAttrWorker),
    takeLatest(actions.productAttrGetRequest.type, productAttrGetWorker),
    takeLatest(actions.variantAttrsListRequest.type, listVariantAttrsWorker),
    takeLatest(actions.variantAttrUpsertRequest.type, upsertVariantAttrWorker),
    takeLatest(actions.variantAttrGetRequest.type, variantAttrGetWorker)
  ]);
}
