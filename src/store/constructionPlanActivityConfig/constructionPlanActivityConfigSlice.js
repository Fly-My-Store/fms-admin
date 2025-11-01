import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  planActivityConfigs: [],
  planActivityConfig: null,
  loading: false,
  error: null
};

const constructionPlanActivityConfigSlice = createSlice({
  name: 'constructionPlanActivityConfig',
  initialState,
  reducers: {
    // Fetch All
    fetchPlanActivityConfigsRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.planActivityConfigs = [];
    },
    fetchPlanActivityConfigsSuccess: (state, action) => {
      state.loading = false;
      state.planActivityConfigs = action.payload;
    },
    fetchPlanActivityConfigsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch by ID
    fetchPlanActivityConfigByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPlanActivityConfigByIdSuccess: (state, action) => {
      state.loading = false;
      state.planActivityConfig = action.payload;
    },
    fetchPlanActivityConfigByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create
    createPlanActivityConfigRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createPlanActivityConfigSuccess: (state, action) => {
      state.loading = false;
      state.planActivityConfigs.push(action.payload);
    },
    createPlanActivityConfigFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update
    updatePlanActivityConfigRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePlanActivityConfigSuccess: (state, action) => {
      state.loading = false;
      state.planActivityConfigs = state.planActivityConfigs.map((item) => (item.id === action.payload.id ? action.payload : item));
    },
    updatePlanActivityConfigFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchPlanActivityConfigsRequest,
  fetchPlanActivityConfigsSuccess,
  fetchPlanActivityConfigsFailure,
  fetchPlanActivityConfigByIdRequest,
  fetchPlanActivityConfigByIdSuccess,
  fetchPlanActivityConfigByIdFailure,
  createPlanActivityConfigRequest,
  createPlanActivityConfigSuccess,
  createPlanActivityConfigFailure,
  updatePlanActivityConfigRequest,
  updatePlanActivityConfigSuccess,
  updatePlanActivityConfigFailure
} = constructionPlanActivityConfigSlice.actions;

export default constructionPlanActivityConfigSlice.reducer;
