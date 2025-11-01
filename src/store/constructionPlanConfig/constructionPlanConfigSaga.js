import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchPlanConfigsRequest,
  fetchPlanConfigsSuccess,
  fetchPlanConfigsFailure,
  fetchPlanConfigByIdRequest,
  fetchPlanConfigByIdSuccess,
  fetchPlanConfigByIdFailure,
  createPlanConfigRequest,
  createPlanConfigSuccess,
  createPlanConfigFailure,
  updatePlanConfigRequest,
  updatePlanConfigSuccess,
  updatePlanConfigFailure
} from './constructionPlanConfigSlice';

import { getPlanConfigs, getPlanConfigById, createPlanConfig, updatePlanConfig } from 'api/constructionPlanConfig';

// Fetch All
function* handleFetchConfigs(action) {
  try {
    const response = yield call(getPlanConfigs, action.payload);
    yield put(fetchPlanConfigsSuccess(response));
  } catch (error) {
    yield put(fetchPlanConfigsFailure(error.message || 'Failed to fetch configs'));
  }
}

// Fetch By ID
function* handleFetchConfigById(action) {
  try {
    const response = yield call(getPlanConfigById, action.payload);
    yield put(fetchPlanConfigByIdSuccess(response));
  } catch (error) {
    yield put(fetchPlanConfigByIdFailure(error.message || 'Failed to fetch config'));
  }
}

// Create
function* handleCreateConfig(action) {
  try {
    const response = yield call(createPlanConfig, action.payload);
    yield put(createPlanConfigSuccess(response));
  } catch (error) {
    yield put(createPlanConfigFailure(error.message || 'Failed to create config'));
  }
}

// Update
function* handleUpdateConfig(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updatePlanConfig, id, data);
    yield put(updatePlanConfigSuccess(response));
  } catch (error) {
    yield put(updatePlanConfigFailure(error.message || 'Failed to update config'));
  }
}

export default function* constructionPlanConfigSaga() {
  yield takeLatest(fetchPlanConfigsRequest.type, handleFetchConfigs);
  yield takeLatest(fetchPlanConfigByIdRequest.type, handleFetchConfigById);
  yield takeLatest(createPlanConfigRequest.type, handleCreateConfig);
  yield takeLatest(updatePlanConfigRequest.type, handleUpdateConfig);
}
