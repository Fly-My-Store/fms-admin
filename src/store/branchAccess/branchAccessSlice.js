// store/branchAccess/branchAccessSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  branchAccesses: [],
  branchAccess: null,
  loading: false,
  error: null
};

const branchAccessSlice = createSlice({
  name: 'branchAccess',
  initialState,
  reducers: {
    // Fetch All
    fetchBranchAccessesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBranchAccessesSuccess: (state, action) => {
      state.loading = false;
      state.branchAccesses = action.payload;
    },
    fetchBranchAccessesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch By ID
    fetchBranchAccessByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBranchAccessByIdSuccess: (state, action) => {
      state.loading = false;
      state.branchAccess = action.payload;
    },
    fetchBranchAccessByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create
    createBranchAccessRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createBranchAccessSuccess: (state, action) => {
      state.loading = false;
      state.branchAccesses.push(action.payload);
    },
    createBranchAccessFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update
    updateBranchAccessRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateBranchAccessSuccess: (state, action) => {
      state.loading = false;
      state.branchAccesses = state.branchAccesses.map((b) => (b.id === action.payload.id ? action.payload : b));
    },
    updateBranchAccessFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchBranchAccessesRequest,
  fetchBranchAccessesSuccess,
  fetchBranchAccessesFailure,
  fetchBranchAccessByIdRequest,
  fetchBranchAccessByIdSuccess,
  fetchBranchAccessByIdFailure,
  createBranchAccessRequest,
  createBranchAccessSuccess,
  createBranchAccessFailure,
  updateBranchAccessRequest,
  updateBranchAccessSuccess,
  updateBranchAccessFailure
} = branchAccessSlice.actions;

export default branchAccessSlice.reducer;
