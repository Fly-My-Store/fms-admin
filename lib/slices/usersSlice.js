import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'users',
  initialState: { list: [], loading: false, error: null },
  reducers: {
    fetchUsers: (s) => { s.loading = true; s.error = null; },
    setUsers: (s, a) => { s.loading = false; s.list = a.payload || []; },
    setUsersError: (s, a) => { s.loading = false; s.error = a.payload; },
  },
});

export const { fetchUsers, setUsers, setUsersError } = slice.actions;
export default slice.reducer;
