import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, loading: false, error: null });
const initialEntity = () => ({ data: null, loading: false, error: null });

const initialState = {
  users: initialList(),
  roles: initialList(),
  permissions: initialList(),
  usersDetail: initialEntity(),
  rolesDetail: initialEntity(),
  permissionsDetail: initialEntity()
};

const slice = createSlice({
  name: 'admin/iam',
  initialState,
  reducers: {
    usersListRequest(state) {
      state.users.loading = true;
      state.users.error = null;
    },
    usersListSuccess(state, action) {
      state.users.loading = false;
      state.users.rows = action.payload?.data || [];
      state.users.meta = action.payload?.meta || state.users.meta;
    },
    usersListFailure(state, action) {
      state.users.loading = false;
      state.users.error = action.payload;
    },
    usersGetRequest(state) {
      state.usersDetail.loading = true;
      state.usersDetail.error = null;
    },
    usersGetSuccess(state, action) {
      state.usersDetail.loading = false;
      state.usersDetail.data = action.payload?.data || action.payload;
    },
    usersGetFailure(state, action) {
      state.usersDetail.loading = false;
      state.usersDetail.error = action.payload;
    },
    usersCreateRequest(state) {
      state.usersDetail.loading = true;
      state.usersDetail.error = null;
    },
    usersCreateSuccess(state, action) {
      state.usersDetail.loading = false;
      state.usersDetail.data = action.payload?.data || action.payload;
    },
    usersCreateFailure(state, action) {
      state.usersDetail.loading = false;
      state.usersDetail.error = action.payload;
    },
    usersUpdateRequest(state) {
      state.usersDetail.loading = true;
      state.usersDetail.error = null;
    },
    usersUpdateSuccess(state, action) {
      state.usersDetail.loading = false;
      state.usersDetail.data = action.payload?.data || action.payload;
    },
    usersUpdateFailure(state, action) {
      state.usersDetail.loading = false;
      state.usersDetail.error = action.payload;
    },
    usersRemoveRequest(state) {
      state.usersDetail.loading = true;
      state.usersDetail.error = null;
    },
    usersRemoveSuccess(state) {
      state.usersDetail.loading = false;
    },
    usersRemoveFailure(state, action) {
      state.usersDetail.loading = false;
      state.usersDetail.error = action.payload;
    },

    rolesListRequest(state) {
      state.roles.loading = true;
      state.roles.error = null;
    },
    rolesListSuccess(state, action) {
      state.roles.loading = false;
      state.roles.rows = action.payload?.data || [];
      state.roles.meta = action.payload?.meta || state.roles.meta;
    },
    rolesListFailure(state, action) {
      state.roles.loading = false;
      state.roles.error = action.payload;
    },
    rolesGetRequest(state) {
      state.rolesDetail.loading = true;
      state.rolesDetail.error = null;
    },
    rolesGetSuccess(state, action) {
      state.rolesDetail.loading = false;
      state.rolesDetail.data = action.payload?.data || action.payload;
    },
    rolesGetFailure(state, action) {
      state.rolesDetail.loading = false;
      state.rolesDetail.error = action.payload;
    },
    rolesCreateRequest(state) {
      state.rolesDetail.loading = true;
      state.rolesDetail.error = null;
    },
    rolesCreateSuccess(state, action) {
      state.rolesDetail.loading = false;
      state.rolesDetail.data = action.payload?.data || action.payload;
    },
    rolesCreateFailure(state, action) {
      state.rolesDetail.loading = false;
      state.rolesDetail.error = action.payload;
    },
    rolesUpdateRequest(state) {
      state.rolesDetail.loading = true;
      state.rolesDetail.error = null;
    },
    rolesUpdateSuccess(state, action) {
      state.rolesDetail.loading = false;
      state.rolesDetail.data = action.payload?.data || action.payload;
    },
    rolesUpdateFailure(state, action) {
      state.rolesDetail.loading = false;
      state.rolesDetail.error = action.payload;
    },
    rolesRemoveRequest(state) {
      state.rolesDetail.loading = true;
      state.rolesDetail.error = null;
    },
    rolesRemoveSuccess(state) {
      state.rolesDetail.loading = false;
    },
    rolesRemoveFailure(state, action) {
      state.rolesDetail.loading = false;
      state.rolesDetail.error = action.payload;
    },

    permissionsListRequest(state) {
      state.permissions.loading = true;
      state.permissions.error = null;
    },
    permissionsListSuccess(state, action) {
      state.permissions.loading = false;
      state.permissions.rows = action.payload?.data || [];
      state.permissions.meta = action.payload?.meta || state.permissions.meta;
    },
    permissionsListFailure(state, action) {
      state.permissions.loading = false;
      state.permissions.error = action.payload;
    },
    permissionsGetRequest(state) {
      state.permissionsDetail.loading = true;
      state.permissionsDetail.error = null;
    },
    permissionsGetSuccess(state, action) {
      state.permissionsDetail.loading = false;
      state.permissionsDetail.data = action.payload?.data || action.payload;
    },
    permissionsGetFailure(state, action) {
      state.permissionsDetail.loading = false;
      state.permissionsDetail.error = action.payload;
    },
    permissionsCreateRequest(state) {
      state.permissionsDetail.loading = true;
      state.permissionsDetail.error = null;
    },
    permissionsCreateSuccess(state, action) {
      state.permissionsDetail.loading = false;
      state.permissionsDetail.data = action.payload?.data || action.payload;
    },
    permissionsCreateFailure(state, action) {
      state.permissionsDetail.loading = false;
      state.permissionsDetail.error = action.payload;
    },
    permissionsUpdateRequest(state) {
      state.permissionsDetail.loading = true;
      state.permissionsDetail.error = null;
    },
    permissionsUpdateSuccess(state, action) {
      state.permissionsDetail.loading = false;
      state.permissionsDetail.data = action.payload?.data || action.payload;
    },
    permissionsUpdateFailure(state, action) {
      state.permissionsDetail.loading = false;
      state.permissionsDetail.error = action.payload;
    },
    permissionsRemoveRequest(state) {
      state.permissionsDetail.loading = true;
      state.permissionsDetail.error = null;
    },
    permissionsRemoveSuccess(state) {
      state.permissionsDetail.loading = false;
    },
    permissionsRemoveFailure(state, action) {
      state.permissionsDetail.loading = false;
      state.permissionsDetail.error = action.payload;
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
