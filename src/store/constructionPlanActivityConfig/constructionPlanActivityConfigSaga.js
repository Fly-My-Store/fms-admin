import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchPlanActivityConfigsRequest,
  fetchPlanActivityConfigsSuccess,
  fetchPlanActivityConfigsFailure,
  fetchPlanActivityConfigByIdRequest,
  fetchPlanActivityConfigByIdSuccess,
  fetchPlanActivityConfigByIdFailure,
  createPlanActivityConfigRequest,
  createPlanActivityConfigSuccess,
  createPlanActivityConfigFailure,
  updatePlanActivityConfigRequest,
  updatePlanActivityConfigSuccess,
  updatePlanActivityConfigFailure
} from './constructionPlanActivityConfigSlice';

import {
  getConstructionPlanActivityConfigs,
  getConstructionPlanActivityConfigById,
  createConstructionPlanActivityConfig,
  updateConstructionPlanActivityConfig
} from 'api/constructionPlanActivityConfig';

// Fetch All
function* handleFetchConfigs(action) {
  try {
    const response = yield call(getConstructionPlanActivityConfigs, action.payload);
    yield put(fetchPlanActivityConfigsSuccess(response));
  } catch (error) {
    yield put(fetchPlanActivityConfigsFailure(error.message || 'Failed to fetch configs'));
  }
}

// Fetch By ID
function* handleFetchConfigById(action) {
  try {
    const response = yield call(getConstructionPlanActivityConfigById, action.payload);
    yield put(fetchPlanActivityConfigByIdSuccess(response));
  } catch (error) {
    yield put(fetchPlanActivityConfigByIdFailure(error.message || 'Failed to fetch config'));
  }
}

// Create
function* handleCreateConfig(action) {
  try {
    const response = yield call(createConstructionPlanActivityConfig, action.payload);
    yield put(createPlanActivityConfigSuccess(response));
  } catch (error) {
    yield put(createPlanActivityConfigFailure(error.message || 'Failed to create config'));
  }
}

// Update
function* handleUpdateConfig(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateConstructionPlanActivityConfig, id, data);
    yield put(updatePlanActivityConfigSuccess(response));
  } catch (error) {
    yield put(updatePlanActivityConfigFailure(error.message || 'Failed to update config'));
  }
}

export default function* constructionPlanActivityConfigSaga() {
  yield takeLatest(fetchPlanActivityConfigsRequest.type, handleFetchConfigs);
  yield takeLatest(fetchPlanActivityConfigByIdRequest.type, handleFetchConfigById);
  yield takeLatest(createPlanActivityConfigRequest.type, handleCreateConfig);
  yield takeLatest(updatePlanActivityConfigRequest.type, handleUpdateConfig);
}
