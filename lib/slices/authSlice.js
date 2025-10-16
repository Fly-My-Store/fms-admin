import { createSlice } from '@reduxjs/toolkit';

const initial = { user: null, token: null, loading: false, error: null };

const slice = createSlice({
  name: 'auth',
  initialState: initial,
  reducers: {
    hydrateFromStorage: (s) => s,
    hydrated: (s, a) => { s.token = a.payload?.token || null; s.user = a.payload?.user || null; },
    loginRequested: (s) => { s.loading = true; s.error = null; },
    loginSucceeded: (s, a) => { s.loading = false; s.user = a.payload.user; s.token = a.payload.token; },
    loginFailed: (s, a) => { s.loading = false; s.error = a.payload; },
    logout: () => initial,
  },
});

export const { hydrateFromStorage, hydrated, loginRequested, loginSucceeded, loginFailed, logout } = slice.actions;
export default slice.reducer;
