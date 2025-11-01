import { call, put, takeLatest, all } from 'redux-saga/effects';

import {
  getDashboardMetricsRequest,
  getDashboardMetricsSuccess,
  getDashboardMetricsFailure,
  getBusinessAdminStatsRequest,
  getBusinessAdminStatsSuccess,
  getBusinessAdminStatsFailure,
  getLoanSummaryRequest,
  getLoanSummarySuccess,
  getLoanSummaryFailure,
  getConstructionPlanSummaryRequest,
  getConstructionPlanSummarySuccess,
  getConstructionPlanSummaryFailure,
  getAnalyticsRequest,
  getAnalyticsSuccess,
  getAnalyticsFailure
} from 'store/dashboard/dashboardSlice';

import { getMetrics, getBusinessStats, getLoanSummary, getConstructionPlanSummary, getAnalytics } from 'api/dashboard';

// === Worker Sagas ===
function* handleGetDashboardMetrics(action) {
  try {
    const response = yield call(getMetrics, action.payload);
    yield put(getDashboardMetricsSuccess(response));
  } catch (error) {
    yield put(getDashboardMetricsFailure(error.message || 'Failed to fetch dashboard metrics'));
  }
}

function* handleGetBusinessAdminStats(action) {
  try {
    const response = yield call(getBusinessStats, action.payload);
    yield put(getBusinessAdminStatsSuccess(response));
  } catch (error) {
    yield put(getBusinessAdminStatsFailure(error.message || 'Failed to fetch business admin stats'));
  }
}

function* handleGetLoanSummary(action) {
  try {
    const response = yield call(getLoanSummary, action.payload);
    yield put(getLoanSummarySuccess(response));
  } catch (error) {
    yield put(getLoanSummaryFailure(error.message || 'Failed to fetch loan summary'));
  }
}

function* handleGetConstructionPlanSummary(action) {
  try {
    const response = yield call(getConstructionPlanSummary, action.payload);
    yield put(getConstructionPlanSummarySuccess(response));
  } catch (error) {
    yield put(getConstructionPlanSummaryFailure(error.message || 'Failed to fetch construction summary'));
  }
}

function* handleGetAnalytics(action) {
  try {
    const response = yield call(getAnalytics, action.payload);
    yield put(getAnalyticsSuccess(response));
  } catch (error) {
    yield put(getAnalyticsFailure(error.message || 'Failed to fetch analytics data'));
  }
}

// === Watcher Saga ===
export default function* dashboardSaga() {
  yield all([
    takeLatest(getDashboardMetricsRequest.type, handleGetDashboardMetrics),
    takeLatest(getBusinessAdminStatsRequest.type, handleGetBusinessAdminStats),
    takeLatest(getLoanSummaryRequest.type, handleGetLoanSummary),
    takeLatest(getConstructionPlanSummaryRequest.type, handleGetConstructionPlanSummary),
    takeLatest(getAnalyticsRequest.type, handleGetAnalytics)
  ]);
}
