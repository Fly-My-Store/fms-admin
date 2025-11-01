import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loansData: {
    loans: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    perPage: 10
  },
  loan: null,
  loanTypes: [],
  loanType: null,
  structureTypes: [],
  structureType: null,
  constructionPlans: [],
  constructionPlan: null,
  disbursalRequestData: {
    disbursalRequests: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    perPage: 10
  },
  disbursalRequestDetail: {},
  loading: false,
  error: null,
  media: [],
  stats: {}
};

const loanSlice = createSlice({
  name: 'loan',
  initialState,
  reducers: {
    // ================= LOAN =================
    fetchLoansRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchLoansSuccess: (state, action) => {
      state.loading = false;
      state.loansData = action.payload;
    },
    fetchLoansFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchLoanByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchLoanByIdSuccess: (state, action) => {
      state.loading = false;
      state.loan = action.payload;
    },
    fetchLoanByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createLoanRequest: (state) => {
      state.loading = true;
    },
    createLoanSuccess: (state, action) => {
      state.loading = false;
      state.loan = action.payload;
    },
    createLoanFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateLoanRequest: (state) => {
      state.loading = true;
    },
    updateLoanSuccess: (state, action) => {
      state.loading = false;
      state.loan = state.loan ? { ...state.loan, ...action.payload } : action.payload;
    },
    updateLoanFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearLoan: (state, action) => {
      state.loading = false;
      state.loan = null;
    },

    // ================= PROPERTY =================
    addPropertyRequest: (state) => {
      state.loading = true;
    },
    addPropertySuccess: (state, action) => {
      state.loading = false;
      state.loan.property = action.payload;
    },
    addPropertyFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updatePropertyRequest: (state) => {
      state.loading = true;
    },
    updatePropertySuccess: (state, action) => {
      state.loading = false;
      state.loan.property = state.loan.property ? { ...state.loan.property, ...action.payload } : action.payload;
    },
    updatePropertyFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ================= Disbursal =================
    addDisbursalRequest: (state) => {
      state.loading = true;
    },
    addDisbursalSuccess: (state, action) => {
      state.loading = false;
      if (!Array.isArray(state.loan.loanDisbursals)) {
        state.loan.loanDisbursals = [];
      }
      state.loan.loanDisbursals.push(action.payload);
    },
    addDisbursalFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateDisbursalRequest: (state) => {
      state.loading = true;
    },
    updateDisbursalSuccess: (state, action) => {
      state.loading = false;
      state.loan.loanDisbursals = state.loan.loanDisbursals.map((disbursal) =>
        disbursal.id === action.payload.id ? { ...disbursal, ...action.payload } : disbursal
      );
    },
    updateDisbursalFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ================= LOAN TYPE =================
    fetchLoanTypesRequest: (state) => {
      state.loading = true;
    },
    fetchLoanTypesSuccess: (state, action) => {
      state.loading = false;
      state.loanTypes = action.payload;
    },
    fetchLoanTypesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchLoanTypeByIdRequest: (state) => {
      state.loading = true;
    },
    fetchLoanTypeByIdSuccess: (state, action) => {
      state.loading = false;
      state.loanType = action.payload;
    },
    fetchLoanTypeByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createLoanTypeRequest: (state) => {
      state.loading = true;
    },
    createLoanTypeSuccess: (state, action) => {
      state.loading = false;
      state.loanTypes.unshift(action.payload);
    },
    createLoanTypeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateLoanTypeRequest: (state) => {
      state.loading = true;
    },
    updateLoanTypeSuccess: (state, action) => {
      state.loading = false;
      state.loanTypes = [action.payload, ...state.loanTypes.filter((item) => item.id !== action.payload.id)];
    },
    updateLoanTypeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ================= STRUCTURE TYPE =================
    fetchStructureTypesRequest: (state) => {
      state.loading = true;
    },
    fetchStructureTypesSuccess: (state, action) => {
      state.loading = false;
      state.structureTypes = action.payload;
    },
    fetchStructureTypesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchStructureTypeByIdRequest: (state) => {
      state.loading = true;
    },
    fetchStructureTypeByIdSuccess: (state, action) => {
      state.loading = false;
      state.structureType = action.payload;
    },
    fetchStructureTypeByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createStructureTypeRequest: (state) => {
      state.loading = true;
    },
    createStructureTypeSuccess: (state, action) => {
      state.loading = false;
      state.structureTypes.unshift(action.payload);
    },
    createStructureTypeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStructureTypeRequest: (state) => {
      state.loading = true;
    },
    updateStructureTypeSuccess: (state, action) => {
      state.loading = false;
      state.structureTypes = [action.payload, ...state.structureTypes.filter((item) => item.id !== action.payload.id)];
    },
    updateStructureTypeFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // ====== Construction Plan ======
    fetchConstructionPlansRequest: (state) => {
      state.loading = true;
      state.constructionPlans = [];
      state.error = null;
    },
    fetchConstructionPlansSuccess: (state, action) => {
      state.loading = false;
      state.constructionPlans = action.payload;
    },
    fetchConstructionPlansFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchConstructionPlanByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchConstructionPlanByIdSuccess: (state, action) => {
      state.loading = false;
      state.constructionPlan = action.payload;
    },
    fetchConstructionPlanByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    generateConstructionPlanRequest: (state) => {
      state.loading = true;
    },
    generateConstructionPlanSuccess: (state, action) => {
      state.loading = false;
      state.constructionPlans = action.payload;
    },
    generateConstructionPlanFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updatePlanProgressRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePlanProgressSuccess: (state, action) => {
      state.loading = false;
      state.constructionPlan = action.payload;
    },
    updatePlanProgressFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // ====== Disbursal Request ======

    fetchDisbursalRequestsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDisbursalRequestsSuccess: (state, action) => {
      state.loading = false;
      state.disbursalRequestData = action.payload;
    },
    fetchDisbursalRequestsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchDisbursalRequestByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDisbursalRequestByIdSuccess: (state, action) => {
      state.loading = false;
      state.disbursalRequestDetail = action.payload;
    },
    fetchDisbursalRequestByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateDisbursalRequestRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateDisbursalRequestSuccess: (state, action) => {
      state.loading = false;

      const updated = action.payload;
      const index = state.disbursalRequestData.disbursalRequests.findIndex((req) => req.id === updated.id);
      if (index !== -1) {
        const existing = state.disbursalRequestData.disbursalRequests[index];
        state.disbursalRequestData.disbursalRequests[index] = {
          ...existing,
          ...updated
        };
      }
    },
    updateDisbursalRequestFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    fetchMediaRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMediaSuccess: (state, action) => {
      state.loading = false;
      state.media = action.payload;
    },
    fetchMediaFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    downloadDisbursementRequestPdfRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    downloadDisbursementRequestPdfSuccess: (state) => {
      state.loading = false;
    },
    downloadDisbursementRequestPdfFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    downloadConstructionReportPdfRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    downloadConstructionReportPdfSuccess: (state) => {
      state.loading = false;
    },
    downloadConstructionReportPdfFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchLoanStatsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchLoanStatsSuccess: (state, action) => {
      state.loading = false;
      state.stats = action.payload;
    },
    fetchLoanStatsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
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
  clearLoan,

  addPropertyRequest,
  addPropertySuccess,
  addPropertyFailure,
  updatePropertyRequest,
  updatePropertySuccess,
  updatePropertyFailure,

  addDisbursalRequest,
  addDisbursalSuccess,
  addDisbursalFailure,
  updateDisbursalRequest,
  updateDisbursalSuccess,
  updateDisbursalFailure,

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

  fetchConstructionPlansRequest,
  fetchConstructionPlansSuccess,
  fetchConstructionPlansFailure,
  fetchConstructionPlanByIdRequest,
  fetchConstructionPlanByIdSuccess,
  fetchConstructionPlanByIdFailure,
  generateConstructionPlanRequest,
  generateConstructionPlanSuccess,
  generateConstructionPlanFailure,
  updatePlanProgressRequest,
  updatePlanProgressSuccess,
  updatePlanProgressFailure,

  fetchDisbursalRequestsRequest,
  fetchDisbursalRequestsSuccess,
  fetchDisbursalRequestsFailure,
  fetchDisbursalRequestByIdRequest,
  fetchDisbursalRequestByIdSuccess,
  fetchDisbursalRequestByIdFailure,
  updateDisbursalRequestRequest,
  updateDisbursalRequestSuccess,
  updateDisbursalRequestFailure,

  fetchMediaRequest,
  fetchMediaSuccess,
  fetchMediaFailure,

  downloadDisbursementRequestPdfRequest,
  downloadDisbursementRequestPdfSuccess,
  downloadDisbursementRequestPdfFailure,

  downloadConstructionReportPdfRequest,
  downloadConstructionReportPdfSuccess,
  downloadConstructionReportPdfFailure,

  fetchLoanStatsRequest,
  fetchLoanStatsSuccess,
  fetchLoanStatsFailure
} = loanSlice.actions;

export default loanSlice.reducer;
