/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from 'utils/constants';

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isLoggedIn: false,

  permissions: [],
  permissionsByName: {},
  isLoaded: false // becomes true once we hydrate either from login or storage
};

function indexPermissions(rows = []) {
  const map = {};
  for (const r of rows) {
    const name = String(r?.name || '').trim();
    if (!name) continue;
    map[name] = {
      create: !!r.create,
      read: !!r.read,
      modify: !!r.modify,
      delete: !!r.delete
    };
  }
  return map;
}

function saveToStorage({ user, token, permissions }) {
  try {
    if (token != null) localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    if (user != null) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    if (permissions != null) localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));
  } catch (e) { }
}

function loadFromStorage() {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const permsStr = localStorage.getItem(STORAGE_KEYS.PERMISSIONS);
    const user = userStr ? JSON.parse(userStr) : null;
    const permissions = permsStr ? JSON.parse(permsStr) : [];
    return { token, user, permissions };
  } catch (e) {
    return { token: null, user: null, permissions: [] };
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateFromStorage(state) {
      const { token, user, permissions } = loadFromStorage();
      state.token = token || null;
      state.user = user || null;
      state.permissions = Array.isArray(permissions) ? permissions : [];
      state.permissionsByName = indexPermissions(state.permissions);
      state.isLoggedIn = !!token && !!user;
      state.loading = false;
      state.error = null;
      state.isLoaded = true;
    },
    loginRequest(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.user = action.payload.user || null;
      state.token = action.payload.token || null;
      state.isLoggedIn = true;

      // NEW: permissions from backend (array)
      const perms = action.payload.permissions || [];
      state.permissions = perms;
      state.permissionsByName = indexPermissions(perms);

      // persist all three
      saveToStorage({ user: state.user, token: state.token, permissions: state.permissions });

      state.isLoaded = true;
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
      state.permissions = [];
      state.permissionsByName = {};
      state.isLoaded = true; // known state
    },

    // ---- logout ----
    logout(state) {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.permissions = [];
      state.permissionsByName = {};
      state.loading = false;
      state.error = null;
      state.isLoaded = true;

      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) { }
    },
    setPermissions(state, action) {
      const perms = action.payload || [];
      state.permissions = perms;
      state.permissionsByName = indexPermissions(perms);
      saveToStorage({ user: state.user, token: state.token, permissions: state.permissions });
      if (!state.isLoaded) state.isLoaded = true;
    },
    forgotPasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    forgotPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetPasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    resetPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    changePasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    changePasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    changePasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  hydrateFromStorage,
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  setPermissions,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  changePasswordRequest,
  changePasswordSuccess,
  changePasswordFailure
} = authSlice.actions;

export default authSlice.reducer;

export const selectAuth = (s) => s.auth;
export const selectUser = (s) => s.auth.user;
export const selectIsLoaded = (s) => s.auth.isLoaded;
export const selectPermissionsByName = (s) => s.auth.permissionsByName;
