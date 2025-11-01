import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  usersData: {
    count: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    data: []
  },
  businessUsersData: {
    count: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
    data: []
  },
  user: null,
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    fetchUsersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action) => {
      state.loading = false;
      console.log('Payload in fetchUsersSuccess:', action.payload);
      state.usersData = action.payload;
    },
    fetchUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
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
    createUserRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createUserSuccess: (state, action) => {
      state.loading = false;
      if (state.usersData.currentPage !== 1) return;
      state.usersData.users.unshift(action.payload); // Add at top
      state.usersData.totalCount += 1;
      // Maintain only up to perPage users
      if (state.usersData.users.length > state.usersData.perPage) {
        state.usersData.users.pop();
      }
      // Recompute totalPages
      state.usersData.totalPages = Math.ceil(state.usersData.totalCount / state.usersData.perPage);
    },
    createUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess: (state, action) => {
      state.loading = false;
      const updatedUser = action.payload;
      const index = state.usersData.users.findIndex((user) => user.id === updatedUser.id);
      if (index !== -1) {
        state.usersData.users[index] = {
          ...state.usersData.users[index],
          ...updatedUser
        };
      }
    },
    updateUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchBusinessUsersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBusinessUsersSuccess: (state, action) => {
      state.loading = false;
      state.businessUsersData = action.payload;
    },
    fetchBusinessUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createBusinessUserRequest: (state) => {
      state.loading = true;
    },
    createBusinessUserSuccess: (state, action) => {
      state.loading = false;
    },
    createBusinessUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateBusinessUserRequest: (state) => {
      state.loading = true;
    },
    updateBusinessUserSuccess: (state, action) => {
      state.loading = false;
    },
    updateBusinessUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearUser: (state, action) => {
      state.loading = false;
      state.user = null;
    },
    clearError: (state, action) => {
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchUserByIdRequest,
  fetchUserByIdSuccess,
  fetchUserByIdFailure,
  createUserRequest,
  createUserSuccess,
  createUserFailure,
  updateUserRequest,
  updateUserSuccess,
  updateUserFailure,
  fetchBusinessUsersRequest,
  fetchBusinessUsersSuccess,
  fetchBusinessUsersFailure,
  createBusinessUserRequest,
  createBusinessUserSuccess,
  createBusinessUserFailure,
  updateBusinessUserRequest,
  updateBusinessUserSuccess,
  updateBusinessUserFailure,
  clearUser,
  clearError
} = userSlice.actions;

export default userSlice.reducer;
