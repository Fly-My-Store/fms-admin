import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'vendors',
  initialState: { list: [], loading: false, error: null },
  reducers: {
    fetchVendors: (s) => { s.loading = true; s.error = null; },
    setVendors: (s, a) => { s.loading = false; s.list = a.payload || []; },
    setVendorsError: (s, a) => { s.loading = false; s.error = a.payload; },
  },
});

export const { fetchVendors, setVendors, setVendorsError } = slice.actions;
export default slice.reducer;
