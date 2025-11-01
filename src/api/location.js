import axiosServices from 'utils/axios';

const endpoints = {
  // --- Branch ---
  branches: 'location/branch',
  branchById: (id) => `location/branch/${id}`,

  // --- Zone ---
  zones: 'location/zone',
  zoneById: (id) => `location/zone/${id}`,

  // --- City ---
  cities: 'location/city',
  cityById: (id) => `location/city/${id}`,

  // --- District ---
  districts: 'location/district',
  districtById: (id) => `location/district/${id}`,

  // --- State ---
  states: 'location/state',
  stateById: (id) => `location/state/${id}`,

  branchSummary: 'location/summary',
  geoMapProperties: 'location/geo-map-properties',
  geoMapBranches: 'location/geo-map-branches'
};

// ===== BRANCH =====
export async function getBranches(params) {
  const response = await axiosServices.get(endpoints.branches, { params });
  return response.data;
}

export async function getBranchById(id) {
  const response = await axiosServices.get(endpoints.branchById(id));
  return response.data;
}

export async function createBranch(payload) {
  const response = await axiosServices.post(endpoints.branches, payload);
  return response.data;
}

export async function updateBranch(id, payload) {
  const response = await axiosServices.put(endpoints.branchById(id), payload);
  return response.data;
}

// ===== ZONE =====
export async function getZones(params) {
  const response = await axiosServices.get(endpoints.zones, { params });
  return response.data;
}

export async function getZoneById(id) {
  const response = await axiosServices.get(endpoints.zoneById(id));
  return response.data;
}

export async function createZone(payload) {
  const response = await axiosServices.post(endpoints.zones, payload);
  return response.data;
}

export async function updateZone(id, payload) {
  const response = await axiosServices.put(endpoints.zoneById(id), payload);
  return response.data;
}

// ===== CITY =====
export async function getCities(params) {
  const response = await axiosServices.get(endpoints.cities, { params });
  return response.data;
}

export async function getCityById(id) {
  const response = await axiosServices.get(endpoints.cityById(id));
  return response.data;
}

export async function createCity(payload) {
  const response = await axiosServices.post(endpoints.cities, payload);
  return response.data;
}

export async function updateCity(id, payload) {
  const response = await axiosServices.put(endpoints.cityById(id), payload);
  return response.data;
}

// ===== DISTRICT =====
export async function getDistricts(params) {
  const response = await axiosServices.get(endpoints.districts, { params });
  return response.data;
}

export async function getDistrictById(id) {
  const response = await axiosServices.get(endpoints.districtById(id));
  return response.data;
}

export async function createDistrict(payload) {
  const response = await axiosServices.post(endpoints.districts, payload);
  return response.data;
}

export async function updateDistrict(id, payload) {
  const response = await axiosServices.put(endpoints.districtById(id), payload);
  return response.data;
}

// ===== STATE =====
export async function getStates(params) {
  const response = await axiosServices.get(endpoints.states, { params });
  return response.data;
}

export async function getStateById(id) {
  const response = await axiosServices.get(endpoints.stateById(id));
  return response.data;
}

export async function createState(payload) {
  const response = await axiosServices.post(endpoints.states, payload);
  return response.data;
}

export async function updateState(id, payload) {
  const response = await axiosServices.put(endpoints.stateById(id), payload);
  return response.data;
}

export async function getBranchSummary(params) {
  const response = await axiosServices.get(endpoints.branchSummary, { params });
  return response.data;
}

export async function getGeoMapBranches(params) {
  const response = await axiosServices.get(endpoints.geoMapBranches, { params });
  return response.data;
}

export async function getGeoMapProperties(params) {
  const response = await axiosServices.get(endpoints.geoMapProperties, { params });
  return response.data;
}
