import { call, put, takeLatest, all } from 'redux-saga/effects';
import { getErrorMessage } from '../../utils/errors';
import { actions } from './slice';
import * as api from '../../api/content';

function* reviewsListWorker(action) {
  try {
    const resp = yield call(api.listReviews, action.payload?.params || {});
    yield put(actions.reviewsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.reviewsListFailure(msg));
  }
}
function* reviewsGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getReview, id);
    yield put(actions.reviewsGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.reviewsGetFailure(msg));
  }
}
function* reviewsUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateReview, id, data);
    yield put(actions.reviewsUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.reviewsUpdateFailure(msg));
  }
}

function* bannersListWorker(action) {
  try {
    const resp = yield call(api.listBanners, action.payload?.params || {});
    yield put(actions.bannersListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.bannersListFailure(msg));
  }
}
function* bannersGetWorker(action) {
  try {
    const { id } = action.payload?.params || {};
    const resp = yield call(api.getBanner, id);
    yield put(actions.bannersGetSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to fetch');
    yield put(actions.bannersGetFailure(msg));
  }
}
function* bannersCreateWorker(action) {
  try {
    const resp = yield call(api.createBanner, action.payload?.params);
    yield put(actions.bannersCreateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Create failed');
    yield put(actions.bannersCreateFailure(msg));
  }
}
function* bannersUpdateWorker(action) {
  try {
    const { id, data } = action.payload?.params || {};
    const resp = yield call(api.updateBanner, id, data);
    yield put(actions.bannersUpdateSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Update failed');
    yield put(actions.bannersUpdateFailure(msg));
  }
}

function* faqsListWorker(action) {
  try {
    const resp = yield call(api.listFaqs, action.payload?.params || {});
    yield put(actions.faqsListSuccess(resp));
  } catch (err) {
    const msg = getErrorMessage(err, 'Failed to load');
    yield put(actions.faqsListFailure(msg));
  }
}

export default function* contentSaga() {
  yield all([
    takeLatest(actions.reviewsListRequest.type, reviewsListWorker),
    takeLatest(actions.reviewsGetRequest.type, reviewsGetWorker),
    takeLatest(actions.reviewsUpdateRequest.type, reviewsUpdateWorker),
    takeLatest(actions.bannersListRequest.type, bannersListWorker),
    takeLatest(actions.bannersGetRequest.type, bannersGetWorker),
    takeLatest(actions.bannersCreateRequest.type, bannersCreateWorker),
    takeLatest(actions.bannersUpdateRequest.type, bannersUpdateWorker),
    takeLatest(actions.faqsListRequest.type, faqsListWorker)
  ]);
}
