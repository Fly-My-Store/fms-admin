import axiosServices from 'utils/axios';
import qs from 'qs';

const endpoints = {
  loan: 'loan',
  loanById: (id) => `loan/${id}`,
  loanPropertyStructureType: 'loan/propertyStructureType',
  loanPropertyStructureTypeById: (id) => `loan/propertyStructureType/${id}`,
  loanType: 'loan/type',
  loanTypeById: (id) => `loan/type/${id}`,
  property: 'loan/property',
  propertyById: (id) => `loan/property/${id}`,
  disbursal: 'loan/disbursal',
  disbursalById: (id) => `loan/disbursal/${id}`,
  constructionPlan: 'constructionPlan',
  constructionPlanById: (id) => `constructionPlan/${id}`,
  disbursalRequest: `loan/disbursal/request`,
  disbursalRequestById: (id) => `loan/disbursal/request/${id}`,
  pdfDisbursalRequestById: (id) => `loan/pdf/disbursal/request/${id}`,
  pdfConstructionProgressById: (id) => `loan/pdf/currentProgress/${id}`,
  media: (loanId) => `loan/media/${loanId}`,
  stats: (loanId) => `loan/stats/${loanId}`
};

// ========== Loan ==========
export async function getLoans(params) {
  const response = await axiosServices.get(endpoints.loan, { params });
  return response.data;
}

export async function getLoanById(id) {
  const response = await axiosServices.get(endpoints.loanById(id));
  return response.data;
}

export async function createLoan(payload) {
  const response = await axiosServices.post(endpoints.loan, payload);
  return response.data;
}

export async function updateLoan(id, payload) {
  const response = await axiosServices.put(endpoints.loanById(id), payload);
  return response.data;
}

// ========== Property ==========

export async function addProperty(payload) {
  const response = await axiosServices.post(endpoints.property, payload);
  return response.data;
}

export async function updateProperty(id, payload) {
  const response = await axiosServices.put(endpoints.propertyById(id), payload);
  return response.data;
}

// ========== Disbursal ==========

export async function addDisbursal(payload) {
  const response = await axiosServices.post(endpoints.disbursal, payload);
  return response.data;
}

export async function updateDisbursal(id, payload) {
  const response = await axiosServices.put(endpoints.disbursalById(id), payload);
  return response.data;
}

// ========== Loan Type ==========
export async function getLoanTypes(params) {
  const response = await axiosServices.get(endpoints.loanType, { params });
  return response.data;
}

export async function getLoanTypeById(id) {
  const response = await axiosServices.get(endpoints.loanTypeById(id));
  return response.data;
}

export async function createLoanType(payload) {
  const response = await axiosServices.post(endpoints.loanType, payload);
  return response.data;
}

export async function updateLoanType(id, payload) {
  const response = await axiosServices.put(endpoints.loanTypeById(id), payload);
  return response.data;
}

// ========== Property Structure Type ==========
export async function getLoanPropertyStructureTypes(params) {
  const response = await axiosServices.get(endpoints.loanPropertyStructureType, { params });
  return response.data;
}

export async function getLoanPropertyStructureTypeById(id) {
  const response = await axiosServices.get(endpoints.loanPropertyStructureTypeById(id));
  return response.data;
}

export async function createLoanPropertyStructureType(payload) {
  const response = await axiosServices.post(endpoints.loanPropertyStructureType, payload);
  return response.data;
}

export async function updateLoanPropertyStructureType(id, payload) {
  const response = await axiosServices.put(endpoints.loanPropertyStructureTypeById(id), payload);
  return response.data;
}

// ========== Construction Plan ==========

export async function getConstructionPlans(params) {
  const response = await axiosServices.get(endpoints.constructionPlan, { params });
  return response.data;
}

export async function getConstructionPlanById(id) {
  const response = await axiosServices.get(endpoints.constructionPlanById(id));
  return response.data;
}

export async function generateConstructionPlan(payload) {
  const response = await axiosServices.post(endpoints.constructionPlan, payload);
  return response.data;
}

export async function updateConstructionPlanProgress(id, payload) {
  const response = await axiosServices.put(endpoints.constructionPlanById(id), payload);
  return response.data;
}

// ========== Disbursal Request ==========

export async function getDisbursalRequests(params) {
  const response = await axiosServices.get(endpoints.disbursalRequest, { params });
  return response.data;
}

export async function getDisbursalRequestById(id) {
  const response = await axiosServices.get(endpoints.disbursalRequestById(id));
  return response.data;
}

export async function updateDisbursalRequests(id, payload) {
  const response = await axiosServices.put(endpoints.disbursalRequestById(id), payload);
  return response.data;
}

export async function getAllMediaByLoanId(id) {
  const response = await axiosServices.get(endpoints.media(id));
  return response.data;
}

export const downloadDisbursementRequestPdf = async (id) => {
  const response = await axiosServices.get(endpoints.pdfDisbursalRequestById(id), {
    responseType: 'blob'
  });
  return response;
};

export const downloadConstructionProgressPdf = async (id, params) => {
  const response = await axiosServices.get(endpoints.pdfConstructionProgressById(id), {
    params,
    paramsSerializer: {
      serialize: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
    },
    responseType: 'blob'
  });
  return response;
};

export async function fetchLoanStats(id) {
  const response = await axiosServices.get(endpoints.stats(id));
  return response.data;
}
