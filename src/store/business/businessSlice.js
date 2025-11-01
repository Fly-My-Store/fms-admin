// store/business/businessSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  businesses: [],
  business: null,
  loading: false,
  error: null
};

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    // Fetch All
    fetchBusinessesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBusinessesSuccess: (state, action) => {
      state.loading = false;
      state.businesses = action.payload;
    },
    fetchBusinessesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch By ID
    fetchBusinessByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBusinessByIdSuccess: (state, action) => {
      state.loading = false;
      state.business = action.payload;
    },
    fetchBusinessByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create
    createBusinessRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createBusinessSuccess: (state, action) => {
      state.loading = false;
      state.businesses.unshift(action.payload);
    },
    createBusinessFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update
    updateBusinessRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateBusinessSuccess: (state, action) => {
      state.loading = false;
      state.businesses = state.businesses.map((b) => (b.id === action.payload.id ? action.payload : b));
    },
    updateBusinessFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    upsertBusinessConfigRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    upsertBusinessConfigSuccess: (state, action) => {
      state.loading = false;
    },
    upsertBusinessConfigFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearBusiness: (state, action) => {
      state.loading = false;
      state.business = null;
    }
  }
});

export const {
  fetchBusinessesRequest,
  fetchBusinessesSuccess,
  fetchBusinessesFailure,
  fetchBusinessByIdRequest,
  fetchBusinessByIdSuccess,
  fetchBusinessByIdFailure,
  createBusinessRequest,
  createBusinessSuccess,
  createBusinessFailure,
  updateBusinessRequest,
  updateBusinessSuccess,
  updateBusinessFailure,
  upsertBusinessConfigRequest,
  upsertBusinessConfigSuccess,
  upsertBusinessConfigFailure,
  clearBusiness
} = businessSlice.actions;

export default businessSlice.reducer;
