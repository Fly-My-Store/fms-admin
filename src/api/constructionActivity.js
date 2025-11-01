import axiosServices from 'utils/axios';

const endpoints = {
  constructionActivity: 'constructionActivity',
  constructionActivityById: (id) => `constructionActivity/${id}`,
  constructionActivitySequence: 'constructionActivity/update-sequence',

  constructionActivityType: 'constructionActivity/type',
  constructionActivityTypeSequence: 'constructionActivity/type/update-sequence',
  constructionActivityTypeById: (id) => `constructionActivity/type/${id}`,

  constructionActivityLevel: 'constructionActivity/level',
  constructionActivityLevelById: (id) => `constructionActivity/level/${id}`
};

// ==============================|| CONSTRUCTION ACTIVITY APIs ||============================== //

export async function getActivities(params) {
  const response = await axiosServices.get(endpoints.constructionActivity, { params });
  return response.data;
}

export async function getActivityById(id) {
  const response = await axiosServices.get(endpoints.constructionActivityById(id));
  return response.data;
}

export async function createActivity(payload) {
  const response = await axiosServices.post(endpoints.constructionActivity, payload);
  return response.data;
}

export async function updateActivity(id, payload) {
  const response = await axiosServices.put(endpoints.constructionActivityById(id), payload);
  return response.data;
}

export async function updateActivitySequence(payload) {
  const response = await axiosServices.put(endpoints.constructionActivitySequence, payload);
  return response.data;
}

// ==============================|| CONSTRUCTION ACTIVITY TYPE APIs ||============================== //

export async function getActivityTypes(params) {
  const response = await axiosServices.get(endpoints.constructionActivityType, { params });
  return response.data;
}

export async function getActivityTypeById(id) {
  const response = await axiosServices.get(endpoints.constructionActivityTypeById(id));
  return response.data;
}

export async function createActivityType(payload) {
  const response = await axiosServices.post(endpoints.constructionActivityType, payload);
  return response.data;
}

export async function updateActivityType(id, payload) {
  const response = await axiosServices.put(endpoints.constructionActivityTypeById(id), payload);
  return response.data;
}

export async function updateActivityTypeSequence(payload) {
  const response = await axiosServices.put(endpoints.constructionActivityTypeSequence, payload);
  return response.data;
}

// ==============================|| CONSTRUCTION ACTIVITY LEVEL APIs ||============================== //

export async function getActivityLevels(params) {
  const response = await axiosServices.get(endpoints.constructionActivityLevel, { params });
  return response.data;
}

export async function getActivityLevelById(id) {
  const response = await axiosServices.get(endpoints.constructionActivityLevelById(id));
  return response.data;
}

export async function createActivityLevel(payload) {
  const response = await axiosServices.post(endpoints.constructionActivityLevel, payload);
  return response.data;
}

export async function updateActivityLevel(id, payload) {
  const response = await axiosServices.put(endpoints.constructionActivityLevelById(id), payload);
  return response.data;
}
