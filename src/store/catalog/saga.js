import { call, put, takeLatest, all } from 'redux-saga/effects';
import { getErrorMessage } from '../../utils/errors';
import { actions } from './slice';
import * as api from '../../api/catalog';

function* brandsListWorker(action) {
  try {
    const resp = yield call(api.listBrands, action.payload?.params || {});
    yield put(actions.brandsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.brandsListFailure(msg));
  }
}

function* brandsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getBrand, id);
    yield put(actions.brandsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.brandsGetFailure(msg));
  }
}
function* brandsCreateWorker(action) {
  try {
    const resp = yield call(api.createBrand, action.payload?.params);
    yield put(actions.brandsCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.brandsCreateFailure(msg));
  }
}
function* brandsUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateBrand, id, data);
    yield put(actions.brandsUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.brandsUpdateFailure(msg));
  }
}
function* brandsRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.removeBrand, id);
    yield put(actions.brandsRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.brandsRemoveFailure(msg));
  }
}

function* categoriesListWorker(action) {
  try {
    const resp = yield call(api.listCategories, action.payload?.params || {});
    yield put(actions.categoriesListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.categoriesListFailure(msg));
  }
}
function* categoriesGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getCategory, id);
    yield put(actions.categoriesGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.categoriesGetFailure(msg));
  }
}
function* categoriesCreateWorker(action) {
  try {
    const resp = yield call(api.createCategory, action.payload?.params);
    yield put(actions.categoriesCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.categoriesCreateFailure(msg));
  }
}
function* categoriesUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateCategory, id, data);
    yield put(actions.categoriesUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.categoriesUpdateFailure(msg));
  }
}
function* categoriesRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.removeCategory, id);
    yield put(actions.categoriesRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.categoriesRemoveFailure(msg));
  }
}

function* productsListWorker(action) {
  try {
    const resp = yield call(api.listProducts, action.payload?.params || {});
    yield put(actions.productsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.productsListFailure(msg));
  }
}
function* productsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getProduct, id);
    yield put(actions.productsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.productsGetFailure(msg));
  }
}
function* productsCreateWorker(action) {
  try {
    const resp = yield call(api.createProduct, action.payload?.params);
    yield put(actions.productsCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.productsCreateFailure(msg));
  }
}
function* productsUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateProduct, id, data);
    yield put(actions.productsUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.productsUpdateFailure(msg));
  }
}
function* productsRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.removeProduct, id);
    yield put(actions.productsRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Delete failed');
    yield put(actions.productsRemoveFailure(msg));
  }
}

function* variantsListWorker(action) {
  try {
    const { product_id, ...query } = action.payload?.params || {};
    const resp = yield call(api.listVariants, product_id, query);
    yield put(actions.variantsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load variants');
    yield put(actions.variantsListFailure(msg));
  }
}

function* variantsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getVariant, id);
    yield put(actions.variantsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch variant');
    yield put(actions.variantsGetFailure(msg));
  }
}

function* variantsCreateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.createVariant, id, data);
    yield put(actions.variantsCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Variant create failed');
    yield put(actions.variantsCreateFailure(msg));
  }
}

function* variantsUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateVariant, id, data);
    yield put(actions.variantsUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Variant update failed');
    yield put(actions.variantsUpdateFailure(msg));
  }
}

function* variantsRemoveWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.removeVariant, id);
    yield put(actions.variantsRemoveSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Variant delete failed');
    yield put(actions.variantsRemoveFailure(msg));
  }
}

export default function* catalogSaga() {
  yield all([
    takeLatest(actions.brandsListRequest.type, brandsListWorker),
    takeLatest(actions.brandsGetRequest.type, brandsGetWorker),
    takeLatest(actions.brandsCreateRequest.type, brandsCreateWorker),
    takeLatest(actions.brandsUpdateRequest.type, brandsUpdateWorker),
    takeLatest(actions.brandsRemoveRequest.type, brandsRemoveWorker),
    takeLatest(actions.categoriesListRequest.type, categoriesListWorker),
    takeLatest(actions.categoriesGetRequest.type, categoriesGetWorker),
    takeLatest(actions.categoriesCreateRequest.type, categoriesCreateWorker),
    takeLatest(actions.categoriesUpdateRequest.type, categoriesUpdateWorker),
    takeLatest(actions.categoriesRemoveRequest.type, categoriesRemoveWorker),
    takeLatest(actions.productsListRequest.type, productsListWorker),
    takeLatest(actions.productsGetRequest.type, productsGetWorker),
    takeLatest(actions.productsCreateRequest.type, productsCreateWorker),
    takeLatest(actions.productsUpdateRequest.type, productsUpdateWorker),
    takeLatest(actions.productsRemoveRequest.type, productsRemoveWorker),
    takeLatest(actions.variantsListRequest.type, variantsListWorker),
    takeLatest(actions.variantsGetRequest.type, variantsGetWorker),
    takeLatest(actions.variantsCreateRequest.type, variantsCreateWorker),
    takeLatest(actions.variantsUpdateRequest.type, variantsUpdateWorker),
    takeLatest(actions.variantsRemoveRequest.type, variantsRemoveWorker)
  ]);
}
