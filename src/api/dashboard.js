import axiosServices from 'utils/axios';

const endpoints = {
  metrics: 'dashboard/metrics',
  businessStats: 'dashboard/business-stats',
  loanSummary: 'dashboard/loan-summary',
  constructionPlanSummary: 'dashboard/construction-plan-summary',
  analytics: 'dashboard/analytics'
};

// PLATFORM APIs
export async function getMetrics(params) {
  const response = await axiosServices.get(endpoints.metrics, { params });
  return response.data;
}

export async function getBusinessStats(params) {
  const response = await axiosServices.get(endpoints.businessStats, { params });
  return response.data;
}

// BUSINESS APIs
export async function getLoanSummary(params) {
  const response = await axiosServices.get(endpoints.loanSummary, { params });
  return response.data;
}

export async function getConstructionPlanSummary(params) {
  const response = await axiosServices.get(endpoints.constructionPlanSummary, { params });
  return response.data;
}

export async function getAnalytics(params) {
  const response = await axiosServices.get(endpoints.analytics, { params });
  return response.data;
}
