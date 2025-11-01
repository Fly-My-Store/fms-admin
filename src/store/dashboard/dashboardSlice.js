import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Loading states
  loadingMetrics: false,
  loadingBusinessStats: false,
  loadingLoanSummary: false,
  loadingConstructionPlanSummary: false,
  loadingAnalytics: false,

  // Data
  metrics: {
    totalBusinesses: 0,
    totalUsers: 0,
    activeUsers: 0,
    activeActivityTypes: 0
  },
  businessStats: [],
  loanSummary: {},
  constructionPlanSummary: {},
  analytics: {},

  error: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Metrics
    getDashboardMetricsRequest(state) {
      state.loadingMetrics = true;
      state.error = null;
    },
    getDashboardMetricsSuccess(state, action) {
      state.loadingMetrics = false;
      state.metrics = action.payload;
    },
    getDashboardMetricsFailure(state, action) {
      state.loadingMetrics = false;
      state.error = action.payload;
    },

    // Business Stats
    getBusinessAdminStatsRequest(state) {
      state.loadingBusinessStats = true;
      state.error = null;
    },
    getBusinessAdminStatsSuccess(state, action) {
      state.loadingBusinessStats = false;
      state.businessStats = action.payload;
    },
    getBusinessAdminStatsFailure(state, action) {
      state.loadingBusinessStats = false;
      state.error = action.payload;
    },

    // Loan Summary
    getLoanSummaryRequest(state) {
      state.loadingLoanSummary = true;
      state.error = null;
    },
    getLoanSummarySuccess(state, action) {
      state.loadingLoanSummary = false;
      state.loanSummary = action.payload;
    },
    getLoanSummaryFailure(state, action) {
      state.loadingLoanSummary = false;
      state.error = action.payload;
    },

    // Construction Summary
    getConstructionPlanSummaryRequest(state) {
      state.loadingConstructionPlanSummary = true;
      state.error = null;
    },
    getConstructionPlanSummarySuccess(state, action) {
      state.loadingConstructionPlanSummary = false;
      state.constructionPlanSummary = action.payload;
    },
    getConstructionPlanSummaryFailure(state, action) {
      state.loadingConstructionPlanSummary = false;
      state.error = action.payload;
    },

    // Analytics
    getAnalyticsRequest(state) {
      state.loadingAnalytics = true;
      state.error = null;
    },
    getAnalyticsSuccess(state, action) {
      state.loadingAnalytics = false;
      state.analytics = action.payload;
    },
    getAnalyticsFailure(state, action) {
      state.loadingAnalytics = false;
      state.error = action.payload;
    }
  }
});

export const {
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
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
