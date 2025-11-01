import axiosServices from 'utils/axios';

const endpoints = {
  constructionPlanActivityConfig: 'constructionPlanActivityConfig',
  constructionPlanActivityConfigById: (id) => `constructionPlanActivityConfig/${id}`
};

export async function getConstructionPlanActivityConfigs(params) {
  const response = await axiosServices.get(endpoints.constructionPlanActivityConfig, { params });
  return response.data;
}

export async function getConstructionPlanActivityConfigById(id) {
  const response = await axiosServices.get(endpoints.constructionPlanActivityConfigById(id));
  return response.data;
}

export async function createConstructionPlanActivityConfig(payload) {
  const response = await axiosServices.post(endpoints.constructionPlanActivityConfig, payload);
  return response.data;
}

export async function updateConstructionPlanActivityConfig(id, payload) {
  const response = await axiosServices.put(endpoints.constructionPlanActivityConfigById(id), payload);
  return response.data;
}
