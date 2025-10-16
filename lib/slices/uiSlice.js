import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'ui',
  initialState: { stats: { users: 0, vendors: 0, ordersToday: 0, gmvToday: 0 } },
  reducers: {
    fetchAdminStats: (s) => s,
    setAdminStats: (s, a) => { s.stats = a.payload || s.stats; },
  },
});

export const { fetchAdminStats, setAdminStats } = slice.actions;
export default slice.reducer;
