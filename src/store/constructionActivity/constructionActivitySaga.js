import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchActivitiesRequest,
  fetchActivitiesSuccess,
  fetchActivitiesFailure,
  fetchActivityByIdRequest,
  fetchActivityByIdSuccess,
  fetchActivityByIdFailure,
  createActivityRequest,
  createActivitySuccess,
  createActivityFailure,
  updateActivityRequest,
  updateActivitySuccess,
  updateActivityFailure,
  updateActivitySequenceRequest,
  updateActivitySequenceSuccess,
  updateActivitySequenceFailure,
  fetchActivityTypesRequest,
  fetchActivityTypesSuccess,
  fetchActivityTypesFailure,
  fetchActivityTypeByIdRequest,
  fetchActivityTypeByIdSuccess,
  fetchActivityTypeByIdFailure,
  createActivityTypeRequest,
  createActivityTypeSuccess,
  createActivityTypeFailure,
  updateActivityTypeRequest,
  updateActivityTypeSuccess,
  updateActivityTypeFailure,
  fetchActivityLevelsRequest,
  fetchActivityLevelsSuccess,
  fetchActivityLevelsFailure,
  fetchActivityLevelByIdRequest,
  fetchActivityLevelByIdSuccess,
  fetchActivityLevelByIdFailure,
  createActivityLevelRequest,
  createActivityLevelSuccess,
  createActivityLevelFailure,
  updateActivityLevelRequest,
  updateActivityLevelSuccess,
  updateActivityLevelFailure,
  updateActivityTypeSequenceSuccess,
  updateActivityTypeSequenceFailure,
  updateActivityTypeSequenceRequest
} from './constructionActivitySlice';

import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  updateActivitySequence,
  getActivityTypes,
  getActivityTypeById,
  createActivityType,
  updateActivityType,
  getActivityLevels,
  getActivityLevelById,
  createActivityLevel,
  updateActivityLevel,
  updateActivityTypeSequence
} from 'api/constructionActivity';

// ======= Activity =======

function* handleFetchActivities(action) {
  try {
    const response = yield call(getActivities, action.payload);
    yield put(fetchActivitiesSuccess(response));
  } catch (error) {
    yield put(fetchActivitiesFailure(error.message));
  }
}

function* handleFetchActivityById(action) {
  try {
    const response = yield call(getActivityById, action.payload);
    yield put(fetchActivityByIdSuccess(response));
  } catch (error) {
    yield put(fetchActivityByIdFailure(error.message));
  }
}

function* handleCreateActivity(action) {
  try {
    const response = yield call(createActivity, action.payload);
    yield put(createActivitySuccess(response));
  } catch (error) {
    yield put(createActivityFailure(error.message));
  }
}

function* handleUpdateActivity(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateActivity, id, data);
    yield put(updateActivitySuccess(response));
  } catch (error) {
    yield put(updateActivityFailure(error.message));
  }
}

function* handleUpdateActivitySequence(action) {
  try {
    yield call(updateActivitySequence, action.payload);
    yield put(updateActivitySequenceSuccess(action.payload));
  } catch (error) {
    yield put(updateActivitySequenceFailure(error.message));
  }
}

// ======= Activity Type =======

function* handleFetchActivityTypes(action) {
  try {
    const response = yield call(getActivityTypes, action.payload);
    yield put(fetchActivityTypesSuccess(response));
  } catch (error) {
    yield put(fetchActivityTypesFailure(error.message));
  }
}

function* handleFetchActivityTypeById(action) {
  try {
    const response = yield call(getActivityTypeById, action.payload);
    yield put(fetchActivityTypeByIdSuccess(response));
  } catch (error) {
    yield put(fetchActivityTypeByIdFailure(error.message));
  }
}

function* handleCreateActivityType(action) {
  try {
    const response = yield call(createActivityType, action.payload);
    yield put(createActivityTypeSuccess(response));
  } catch (error) {
    yield put(createActivityTypeFailure(error.message));
  }
}

function* handleUpdateActivityType(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateActivityType, id, data);
    yield put(updateActivityTypeSuccess(response));
  } catch (error) {
    yield put(updateActivityTypeFailure(error.message));
  }
}

function* handleUpdateActivityTypeSequence(action) {
  try {
    yield call(updateActivityTypeSequence, action.payload);
    yield put(updateActivityTypeSequenceSuccess(action.payload));
  } catch (error) {
    yield put(updateActivityTypeSequenceFailure(error.message));
  }
}

// ======= Activity Level =======

function* handleFetchActivityLevels(action) {
  try {
    const response = yield call(getActivityLevels, action.payload);
    yield put(fetchActivityLevelsSuccess(response));
  } catch (error) {
    yield put(fetchActivityLevelsFailure(error.message));
  }
}

function* handleFetchActivityLevelById(action) {
  try {
    const response = yield call(getActivityLevelById, action.payload);
    yield put(fetchActivityLevelByIdSuccess(response));
  } catch (error) {
    yield put(fetchActivityLevelByIdFailure(error.message));
  }
}

function* handleCreateActivityLevel(action) {
  try {
    const response = yield call(createActivityLevel, action.payload);
    yield put(createActivityLevelSuccess(response));
  } catch (error) {
    yield put(createActivityLevelFailure(error.message));
  }
}

function* handleUpdateActivityLevel(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateActivityLevel, id, data);
    yield put(updateActivityLevelSuccess(response));
  } catch (error) {
    yield put(updateActivityLevelFailure(error.message));
  }
}

// ==================== WATCHER ====================

export default function* constructionActivitySaga() {
  yield takeLatest(fetchActivitiesRequest.type, handleFetchActivities);
  yield takeLatest(fetchActivityByIdRequest.type, handleFetchActivityById);
  yield takeLatest(createActivityRequest.type, handleCreateActivity);
  yield takeLatest(updateActivityRequest.type, handleUpdateActivity);
  yield takeLatest(updateActivitySequenceRequest.type, handleUpdateActivitySequence);

  yield takeLatest(fetchActivityTypesRequest.type, handleFetchActivityTypes);
  yield takeLatest(fetchActivityTypeByIdRequest.type, handleFetchActivityTypeById);
  yield takeLatest(createActivityTypeRequest.type, handleCreateActivityType);
  yield takeLatest(updateActivityTypeRequest.type, handleUpdateActivityType);
  yield takeLatest(updateActivityTypeSequenceRequest.type, handleUpdateActivityTypeSequence);

  yield takeLatest(fetchActivityLevelsRequest.type, handleFetchActivityLevels);
  yield takeLatest(fetchActivityLevelByIdRequest.type, handleFetchActivityLevelById);
  yield takeLatest(createActivityLevelRequest.type, handleCreateActivityLevel);
  yield takeLatest(updateActivityLevelRequest.type, handleUpdateActivityLevel);
}
