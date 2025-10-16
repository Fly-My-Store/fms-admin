import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'orders',
  initialState: { list: [], loading: false, error: null },
  reducers: {
    fetchOrders: (s) => { s.loading = true; s.error = null; },
    setOrders: (s, a) => { s.loading = false; s.list = a.payload || []; },
    setOrdersError: (s, a) => { s.loading = false; s.error = a.payload; },
  },
});

export const { fetchOrders, setOrders, setOrdersError } = slice.actions;
export default slice.reducer;
