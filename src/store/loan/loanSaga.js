import { call, put, takeLatest, all } from 'redux-saga/effects';
import {
  fetchLoansRequest,
  fetchLoansSuccess,
  fetchLoansFailure,
  fetchLoanByIdRequest,
  fetchLoanByIdSuccess,
  fetchLoanByIdFailure,
  createLoanRequest,
  createLoanSuccess,
  createLoanFailure,
  updateLoanRequest,
  updateLoanSuccess,
  updateLoanFailure,
  fetchLoanTypesRequest,
  fetchLoanTypesSuccess,
  fetchLoanTypesFailure,
  fetchLoanTypeByIdRequest,
  fetchLoanTypeByIdSuccess,
  fetchLoanTypeByIdFailure,
  createLoanTypeRequest,
  createLoanTypeSuccess,
  createLoanTypeFailure,
  updateLoanTypeRequest,
  updateLoanTypeSuccess,
  updateLoanTypeFailure,
  fetchStructureTypesRequest,
  fetchStructureTypesSuccess,
  fetchStructureTypesFailure,
  fetchStructureTypeByIdRequest,
  fetchStructureTypeByIdSuccess,
  fetchStructureTypeByIdFailure,
  createStructureTypeRequest,
  createStructureTypeSuccess,
  createStructureTypeFailure,
  updateStructureTypeRequest,
  updateStructureTypeSuccess,
  updateStructureTypeFailure,
  addPropertySuccess,
  addPropertyFailure,
  updatePropertySuccess,
  updatePropertyFailure,
  addPropertyRequest,
  updatePropertyRequest,
  addDisbursalSuccess,
  addDisbursalFailure,
  updateDisbursalSuccess,
  updateDisbursalFailure,
  addDisbursalRequest,
  updateDisbursalRequest,
  fetchConstructionPlansSuccess,
  fetchConstructionPlansFailure,
  fetchConstructionPlanByIdSuccess,
  fetchConstructionPlanByIdFailure,
  generateConstructionPlanSuccess,
  generateConstructionPlanFailure,
  fetchConstructionPlansRequest,
  fetchConstructionPlanByIdRequest,
  generateConstructionPlanRequest,
  updatePlanProgressSuccess,
  updatePlanProgressFailure,
  updatePlanProgressRequest,
  fetchDisbursalRequestsSuccess,
  fetchDisbursalRequestsFailure,
  fetchDisbursalRequestsRequest,
  fetchDisbursalRequestByIdRequest,
  fetchDisbursalRequestByIdSuccess,
  fetchDisbursalRequestByIdFailure,
  fetchMediaSuccess,
  fetchMediaFailure,
  fetchMediaRequest,
  updateDisbursalRequestSuccess,
  updateDisbursalRequestFailure,
  updateDisbursalRequestRequest,
  downloadDisbursementRequestPdfSuccess,
  downloadDisbursementRequestPdfFailure,
  downloadDisbursementRequestPdfRequest,
  downloadConstructionReportPdfSuccess,
  downloadConstructionReportPdfFailure,
  downloadConstructionReportPdfRequest,
  fetchLoanStatsSuccess,
  fetchLoanStatsFailure,
  fetchLoanStatsRequest
} from './loanSlice';

import {
  getLoans,
  getLoanById,
  createLoan,
  updateLoan,
  addProperty,
  updateProperty,
  getLoanTypes,
  getLoanTypeById,
  createLoanType,
  updateLoanType,
  getLoanPropertyStructureTypes,
  getLoanPropertyStructureTypeById,
  createLoanPropertyStructureType,
  updateLoanPropertyStructureType,
  addDisbursal,
  updateDisbursal,
  getConstructionPlans,
  getConstructionPlanById,
  generateConstructionPlan,
  updateConstructionPlanProgress,
  getDisbursalRequests,
  getAllMediaByLoanId,
  updateDisbursalRequests,
  downloadDisbursementRequestPdf,
  downloadConstructionProgressPdf,
  fetchLoanStats,
  getDisbursalRequestById
} from 'api/loan';
import dayjs from 'dayjs';

// ========== LOAN ==========
function* handleFetchLoans(action) {
  try {
    const response = yield call(getLoans, action.payload);
    yield put(fetchLoansSuccess(response));
  } catch (error) {
    yield put(fetchLoansFailure(error.message));
  }
}

function* handleFetchLoanById(action) {
  try {
    const response = yield call(getLoanById, action.payload);
    yield put(fetchLoanByIdSuccess(response));
  } catch (error) {
    yield put(fetchLoanByIdFailure(error.message));
  }
}

function* handleCreateLoan(action) {
  const { data, callback, onError } = action.payload;
  try {
    const response = yield call(createLoan, data);
    yield put(createLoanSuccess(response));
    if (callback) callback();
  } catch (error) {
    const errorMessage = error?.message || 'Loan could not be created.';
    yield put(createLoanFailure(error.message));
    if (onError) onError(errorMessage);
  }
}

function* handleUpdateLoan(action) {
  const { id, data, callback, onError } = action.payload;
  try {
    const response = yield call(updateLoan, id, data);
    yield put(updateLoanSuccess(response));
    if (callback) callback();
  } catch (error) {
    const errorMessage = error?.message || 'Loan could not be updated.';
    yield put(updateLoanFailure(error.message));
    if (onError) onError(errorMessage);
  }
}

function* handleAddProperty(action) {
  try {
    const response = yield call(addProperty, action.payload);
    yield put(addPropertySuccess(response));
  } catch (error) {
    yield put(addPropertyFailure(error.message));
  }
}

function* handleUpdateProperty(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateProperty, id, data);
    yield put(updatePropertySuccess(response));
  } catch (error) {
    yield put(updatePropertyFailure(error.message));
  }
}

function* handleAddDisbursal(action) {
  try {
    const response = yield call(addDisbursal, action.payload);
    yield put(addDisbursalSuccess(response));
  } catch (error) {
    yield put(addDisbursalFailure(error.message));
  }
}

function* handleUpdateDisbursal(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateDisbursal, id, data);
    yield put(updateDisbursalSuccess(response));
  } catch (error) {
    yield put(updateDisbursalFailure(error.message));
  }
}

// ========== LOAN TYPE ==========
function* handleFetchLoanTypes(action) {
  try {
    const response = yield call(getLoanTypes, action.payload);
    yield put(fetchLoanTypesSuccess(response));
  } catch (error) {
    yield put(fetchLoanTypesFailure(error.message));
  }
}

function* handleFetchLoanTypeById(action) {
  try {
    const response = yield call(getLoanTypeById, action.payload);
    yield put(fetchLoanTypeByIdSuccess(response));
  } catch (error) {
    yield put(fetchLoanTypeByIdFailure(error.message));
  }
}

function* handleCreateLoanType(action) {
  try {
    const response = yield call(createLoanType, action.payload);
    yield put(createLoanTypeSuccess(response));
  } catch (error) {
    yield put(createLoanTypeFailure(error.message));
  }
}

function* handleUpdateLoanType(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateLoanType, id, data);
    yield put(updateLoanTypeSuccess(response));
  } catch (error) {
    yield put(updateLoanTypeFailure(error.message));
  }
}

// ========== PROPERTY STRUCTURE TYPE ==========
function* handleFetchStructureTypes(action) {
  try {
    const response = yield call(getLoanPropertyStructureTypes, action.payload);
    yield put(fetchStructureTypesSuccess(response));
  } catch (error) {
    yield put(fetchStructureTypesFailure(error.message));
  }
}

function* handleFetchStructureTypeById(action) {
  try {
    const response = yield call(getLoanPropertyStructureTypeById, action.payload);
    yield put(fetchStructureTypeByIdSuccess(response));
  } catch (error) {
    yield put(fetchStructureTypeByIdFailure(error.message));
  }
}

function* handleCreateStructureType(action) {
  try {
    const response = yield call(createLoanPropertyStructureType, action.payload);
    yield put(createStructureTypeSuccess(response));
  } catch (error) {
    yield put(createStructureTypeFailure(error.message));
  }
}

function* handleUpdateStructureType(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateLoanPropertyStructureType, id, data);
    yield put(updateStructureTypeSuccess(response));
  } catch (error) {
    yield put(updateStructureTypeFailure(error.message));
  }
}

// ========== CONSTRUCTION PLAN ==========
function* handleFetchConstructionPlans(action) {
  try {
    const response = yield call(getConstructionPlans, action.payload);
    yield put(fetchConstructionPlansSuccess(response));
  } catch (error) {
    yield put(fetchConstructionPlansFailure(error.message));
  }
}

function* handleFetchConstructionPlanById(action) {
  try {
    const response = yield call(getConstructionPlanById, action.payload);
    yield put(fetchConstructionPlanByIdSuccess(response));
  } catch (error) {
    yield put(fetchConstructionPlanByIdFailure(error.message));
  }
}

function* handleGenerateConstructionPlan(action) {
  try {
    const response = yield call(generateConstructionPlan, action.payload);
    yield put(generateConstructionPlanSuccess(response));
  } catch (error) {
    yield put(generateConstructionPlanFailure(error.message));
  }
}

function* handleUpdatePlanProgress(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateConstructionPlanProgress, id, data);
    yield put(updatePlanProgressSuccess(response));
  } catch (error) {
    yield put(updatePlanProgressFailure(error.message));
  }
}

function* handleFetchDisbursalRequests(action) {
  try {
    const response = yield call(getDisbursalRequests, action.payload);
    yield put(fetchDisbursalRequestsSuccess(response));
  } catch (error) {
    yield put(fetchDisbursalRequestsFailure(error.message));
  }
}

function* handleFetchDisbursalRequestById(action) {
  try {
    const response = yield call(getDisbursalRequestById, action.payload);
    yield put(fetchDisbursalRequestByIdSuccess(response));
  } catch (error) {
    yield put(fetchDisbursalRequestByIdFailure(error.message));
  }
}

function* handleUpdateDisbursalRequest(action) {
  try {
    const { id, data } = action.payload;
    const response = yield call(updateDisbursalRequests, id, data);
    yield put(updateDisbursalRequestSuccess(response));
  } catch (error) {
    yield put(updateDisbursalRequestFailure(error.message));
  }
}

function* handleFetchMedia(action) {
  try {
    const response = yield call(getAllMediaByLoanId, action.payload);
    yield put(fetchMediaSuccess(response));
  } catch (error) {
    yield put(fetchMediaFailure(error.message));
  }
}

function* handleDownloadDisbursementPdf(action) {
  try {
    const { id, params } = action.payload;
    const response = yield call(downloadDisbursementRequestPdf, id);
    const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    const now = dayjs().format('DD-MM-YYYY');
    link.setAttribute('download', `DRF_${params.loanNumber || ''}_${now}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    yield put(downloadDisbursementRequestPdfSuccess());
  } catch (error) {
    yield put(downloadDisbursementRequestPdfFailure(error.message));
  }
}

function* handleDownloadConstructionReport(action) {
  try {
    const { id, params } = action.payload;
    const response = yield call(downloadConstructionProgressPdf, id, params);
    const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    const now = dayjs().format('DD-MM-YYYY');
    link.setAttribute('download', `CPR_${params.loanNumber || ''}_${now}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    yield put(downloadConstructionReportPdfSuccess());
  } catch (error) {
    yield put(downloadConstructionReportPdfFailure(error.message));
  }
}

function* handleFetchLoanStats(action) {
  try {
    const response = yield call(fetchLoanStats, action.payload);
    yield put(fetchLoanStatsSuccess(response));
  } catch (err) {
    yield put(fetchLoanStatsFailure(err.message || 'Error fetching loan stats'));
  }
}

// ========== COMBINED ==========
export default function* loanSaga() {
  yield all([
    takeLatest(fetchLoansRequest.type, handleFetchLoans),
    takeLatest(fetchLoanByIdRequest.type, handleFetchLoanById),
    takeLatest(createLoanRequest.type, handleCreateLoan),
    takeLatest(updateLoanRequest.type, handleUpdateLoan),

    takeLatest(addPropertyRequest.type, handleAddProperty),
    takeLatest(updatePropertyRequest.type, handleUpdateProperty),

    takeLatest(addDisbursalRequest.type, handleAddDisbursal),
    takeLatest(updateDisbursalRequest.type, handleUpdateDisbursal),

    takeLatest(fetchLoanTypesRequest.type, handleFetchLoanTypes),
    takeLatest(fetchLoanTypeByIdRequest.type, handleFetchLoanTypeById),
    takeLatest(createLoanTypeRequest.type, handleCreateLoanType),
    takeLatest(updateLoanTypeRequest.type, handleUpdateLoanType),

    takeLatest(fetchStructureTypesRequest.type, handleFetchStructureTypes),
    takeLatest(fetchStructureTypeByIdRequest.type, handleFetchStructureTypeById),
    takeLatest(createStructureTypeRequest.type, handleCreateStructureType),
    takeLatest(updateStructureTypeRequest.type, handleUpdateStructureType),

    takeLatest(fetchConstructionPlansRequest.type, handleFetchConstructionPlans),
    takeLatest(fetchConstructionPlanByIdRequest.type, handleFetchConstructionPlanById),
    takeLatest(generateConstructionPlanRequest.type, handleGenerateConstructionPlan),
    takeLatest(updatePlanProgressRequest.type, handleUpdatePlanProgress),

    takeLatest(fetchDisbursalRequestsRequest.type, handleFetchDisbursalRequests),
    takeLatest(fetchDisbursalRequestByIdRequest.type, handleFetchDisbursalRequestById),
    takeLatest(updateDisbursalRequestRequest.type, handleUpdateDisbursalRequest),

    takeLatest(fetchMediaRequest.type, handleFetchMedia),
    takeLatest(downloadDisbursementRequestPdfRequest.type, handleDownloadDisbursementPdf),
    takeLatest(downloadConstructionReportPdfRequest.type, handleDownloadConstructionReport),

    takeLatest(fetchLoanStatsRequest.type, handleFetchLoanStats)
  ]);
}
