import axiosServices from 'utils/axios';

const endpoints = {
  planConfig: 'constructionPlanConfig',
  planConfigById: (id) => `constructionPlanConfig/${id}`
};

// Get all Construction Plan Configs
export async function getPlanConfigs(params) {
  const response = await axiosServices.get(endpoints.planConfig, { params });
  return response.data;
}

// Get a single Construction Plan Config by ID
export async function getPlanConfigById(id) {
  const response = await axiosServices.get(endpoints.planConfigById(id));
  return response.data;
}

// Create a new Construction Plan Config
export async function createPlanConfig(payload) {
  const response = await axiosServices.post(endpoints.planConfig, payload);
  return response.data;
}

// Update an existing Construction Plan Config
export async function updatePlanConfig(id, payload) {
  const response = await axiosServices.put(endpoints.planConfigById(id), payload);
  return response.data;
}
