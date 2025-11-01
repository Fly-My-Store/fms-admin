import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  planConfigs: [],
  planConfig: null,
  loading: false,
  error: null
};

const constructionPlanConfigSlice = createSlice({
  name: 'constructionPlanConfig',
  initialState,
  reducers: {
    // Fetch All
    fetchPlanConfigsRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.planConfigs = [];
    },
    fetchPlanConfigsSuccess: (state, action) => {
      state.loading = false;
      state.planConfigs = action.payload;
    },
    fetchPlanConfigsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch by ID
    fetchPlanConfigByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPlanConfigByIdSuccess: (state, action) => {
      state.loading = false;
      state.planConfig = action.payload;
    },
    fetchPlanConfigByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createPlanConfigRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createPlanConfigSuccess: (state, action) => {
      state.loading = false;
      state.planConfigs.push(action.payload);
      state.planConfig = action.payload;
    },
    createPlanConfigFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update
    updatePlanConfigRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePlanConfigSuccess: (state, action) => {
      state.loading = false;
      state.planConfigs = state.planConfigs.map((item) => (item.id === action.payload.id ? action.payload : item));
      state.planConfig = action.payload;
    },
    updatePlanConfigFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearPlanConfigRequest: (state, action) => {
      state.loading = false;
      state.planConfig = null;
    }
  }
});

export const {
  fetchPlanConfigsRequest,
  fetchPlanConfigsSuccess,
  fetchPlanConfigsFailure,
  fetchPlanConfigByIdRequest,
  fetchPlanConfigByIdSuccess,
  fetchPlanConfigByIdFailure,
  createPlanConfigRequest,
  createPlanConfigSuccess,
  createPlanConfigFailure,
  updatePlanConfigRequest,
  updatePlanConfigSuccess,
  updatePlanConfigFailure,
  clearPlanConfigRequest
} = constructionPlanConfigSlice.actions;

export default constructionPlanConfigSlice.reducer;
