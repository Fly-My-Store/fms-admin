// store/branch/branchSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  branchesData: {
    branches: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    perPage: 10
  },
  branch: null,
  loading: false,
  error: null
};

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    // Fetch All
    fetchBranchesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBranchesSuccess: (state, action) => {
      state.loading = false;
      state.branchesData = action.payload;
    },
    fetchBranchesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch By ID
    fetchBranchByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBranchByIdSuccess: (state, action) => {
      state.loading = false;
      state.branch = action.payload;
    },
    fetchBranchByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create
    createBranchRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createBranchSuccess: (state, action) => {
      state.loading = false;
      state.branchesData.branches = [action.payload, ...state.branchesData.branches];

      if (state.branchesData.branches.length > state.branchesData.perPage) {
        state.branchesData.branches.pop();
      }
      state.branchesData.totalCount += 1;
    },
    createBranchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update
    updateBranchRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateBranchSuccess: (state, action) => {
      state.loading = false;
      state.branchesData.branches = state.branchesData.branches.map((b) => (b.id === action.payload.id ? action.payload : b));
    },
    updateBranchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchBranchesRequest,
  fetchBranchesSuccess,
  fetchBranchesFailure,
  fetchBranchByIdRequest,
  fetchBranchByIdSuccess,
  fetchBranchByIdFailure,
  createBranchRequest,
  createBranchSuccess,
  createBranchFailure,
  updateBranchRequest,
  updateBranchSuccess,
  updateBranchFailure
} = branchSlice.actions;

export default branchSlice.reducer;
