import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roles: [],
  role: null,
  permissions: [],
  permission: null,
  loading: false,
  error: null
};

const rolePermissionSlice = createSlice({
  name: 'rolePermission',
  initialState,
  reducers: {
    // Roles
    fetchRolesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchRolesSuccess: (state, action) => {
      state.loading = false;
      state.roles = action.payload;
    },
    fetchRolesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    getRoleByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getRoleByIdSuccess: (state, action) => {
      state.loading = false;
      state.role = action.payload;
    },
    getRoleByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createRoleRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createRoleSuccess: (state, action) => {
      state.loading = false;
      state.roles.push(action.payload.role);
    },
    createRoleFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updateRoleRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateRoleSuccess: (state, action) => {
      state.loading = false;
      state.roles = state.roles.map((role) => (role.id === action.payload.role.id ? action.payload.role : role));
    },
    updateRoleFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Permissions
    fetchPermissionsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPermissionsSuccess: (state, action) => {
      state.loading = false;
      state.permissions = action.payload;
    },
    fetchPermissionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    getPermissionByIdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getPermissionByIdSuccess: (state, action) => {
      state.loading = false;
      state.permission = action.payload;
    },
    getPermissionByIdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    createPermissionRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    createPermissionSuccess: (state, action) => {
      state.loading = false;
      state.permissions.push(action.payload);
    },
    createPermissionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    updatePermissionRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    updatePermissionSuccess: (state, action) => {
      state.loading = false;
      state.permissions = state.permissions.map((perm) => (perm.id === action.payload.id ? action.payload : perm));
    },
    updatePermissionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Assignment
    assignPermissionsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    assignPermissionsSuccess: (state) => {
      state.loading = false;
    },
    assignPermissionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchRolesRequest,
  fetchRolesSuccess,
  fetchRolesFailure,
  getRoleByIdRequest,
  getRoleByIdSuccess,
  getRoleByIdFailure,
  createRoleRequest,
  createRoleSuccess,
  createRoleFailure,
  updateRoleRequest,
  updateRoleSuccess,
  updateRoleFailure,
  fetchPermissionsRequest,
  fetchPermissionsSuccess,
  fetchPermissionsFailure,
  getPermissionByIdRequest,
  getPermissionByIdSuccess,
  getPermissionByIdFailure,
  createPermissionRequest,
  createPermissionSuccess,
  createPermissionFailure,
  updatePermissionRequest,
  updatePermissionSuccess,
  updatePermissionFailure,
  assignPermissionsRequest,
  assignPermissionsSuccess,
  assignPermissionsFailure
} = rolePermissionSlice.actions;

export default rolePermissionSlice.reducer;
