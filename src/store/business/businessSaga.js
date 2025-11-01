// businessSaga.js
import { call, put, takeLatest, all } from 'redux-saga/effects';
import {
  fetchBusinessesRequest,
  fetchBusinessesSuccess,
  fetchBusinessesFailure,
  fetchBusinessByIdRequest,
  fetchBusinessByIdSuccess,
  fetchBusinessByIdFailure,
  createBusinessRequest,
  createBusinessSuccess,
  createBusinessFailure,
  updateBusinessRequest,
  updateBusinessSuccess,
  updateBusinessFailure,
  upsertBusinessConfigSuccess,
  upsertBusinessConfigFailure,
  upsertBusinessConfigRequest
} from './businessSlice';
import { getBusinesses, getBusinessById, createBusiness, updateBusiness, upsertBusinessConfiguration } from 'api/business';

function* handleFetchBusinesses(action) {
  try {
    const response = yield call(getBusinesses, action.payload);
    yield put(fetchBusinessesSuccess(response));
  } catch (error) {
    yield put(fetchBusinessesFailure(error.message || 'Failed to fetch businesses'));
  }
}

function* handleFetchBusinessById(action) {
  try {
    const response = yield call(getBusinessById, action.payload);
    yield put(fetchBusinessByIdSuccess(response));
  } catch (error) {
    yield put(fetchBusinessByIdFailure(error.message || 'Failed to fetch business'));
  }
}

function* handleCreateBusiness(action) {
  try {
    const response = yield call(createBusiness, action.payload);
    yield put(createBusinessSuccess(response));
  } catch (error) {
    yield put(createBusinessFailure(error.message || 'Failed to create business'));
  }
}

function* handleUpdateBusiness(action) {
  try {
    const { id, data } = payload;
    const response = yield call(updateBusiness, id, data);
    yield put(updateBusinessSuccess(response));
  } catch (error) {
    yield put(updateBusinessFailure(error.message || 'Failed to update business'));
  }
}

function* handleUpsertBusinessConfig(action) {
  try {
    const response = yield call(upsertBusinessConfiguration, action.payload);
    yield put(upsertBusinessConfigSuccess(response));
  } catch (error) {
    yield put(upsertBusinessConfigFailure(error.message));
  }
}

export default function* businessSaga() {
  yield all([
    takeLatest(fetchBusinessesRequest.type, handleFetchBusinesses),
    takeLatest(fetchBusinessByIdRequest.type, handleFetchBusinessById),
    takeLatest(createBusinessRequest.type, handleCreateBusiness),
    takeLatest(updateBusinessRequest.type, handleUpdateBusiness),
    takeLatest(upsertBusinessConfigRequest.type, handleUpsertBusinessConfig)
  ]);
}
