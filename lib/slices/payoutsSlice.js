import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'payouts',
  initialState: { list: [], loading: false, error: null },
  reducers: {
    fetchPayouts: (s) => { s.loading = true; s.error = null; },
    setPayouts: (s, a) => { s.loading = false; s.list = a.payload || []; },
    setPayoutsError: (s, a) => { s.loading = false; s.error = a.payload; },
  },
});

export const { fetchPayouts, setPayouts, setPayoutsError } = slice.actions;
export default slice.reducer;
