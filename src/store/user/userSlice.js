import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    fetchUserByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUserByIdSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
    },
    fetchUserByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearUser: (state) => {
      state.loading = false;
      state.user = null;
    },
    clearError: (state) => {
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  fetchUserByIdRequest,
  fetchUserByIdSuccess,
  fetchUserByIdFailure,
  clearUser,
  clearError
} = userSlice.actions;

export default userSlice.reducer;
