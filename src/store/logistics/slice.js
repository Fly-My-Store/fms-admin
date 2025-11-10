import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, loading: false, error: null });
const initialEntity = () => ({ data: null, loading: false, error: null });

const initialState = {
  deliveries: initialList(),
  riders: initialList(),
  deliveriesDetail: initialEntity(),
  ridersDetail: initialEntity()
};

const slice = createSlice({
  name: 'admin/logistics',
  initialState,
  reducers: {
    deliveriesListRequest(state) {
      state.deliveries.loading = true;
      state.deliveries.error = null;
    },
    deliveriesListSuccess(state, action) {
      state.deliveries.loading = false;
      state.deliveries.rows = action.payload?.data || [];
      state.deliveries.meta = action.payload?.meta || state.deliveries.meta;
    },
    deliveriesListFailure(state, action) {
      state.deliveries.loading = false;
      state.deliveries.error = action.payload;
    },
    deliveriesGetRequest(state) {
      state.deliveriesDetail.loading = true;
      state.deliveriesDetail.error = null;
    },
    deliveriesGetSuccess(state, action) {
      state.deliveriesDetail.loading = false;
      state.deliveriesDetail.data = action.payload?.data || action.payload;
    },
    deliveriesGetFailure(state, action) {
      state.deliveriesDetail.loading = false;
      state.deliveriesDetail.error = action.payload;
    },
    deliveriesCreateRequest(state) {
      state.deliveriesDetail.loading = true;
      state.deliveriesDetail.error = null;
    },
    deliveriesCreateSuccess(state, action) {
      state.deliveriesDetail.loading = false;
      state.deliveriesDetail.data = action.payload?.data || action.payload;
    },
    deliveriesCreateFailure(state, action) {
      state.deliveriesDetail.loading = false;
      state.deliveriesDetail.error = action.payload;
    },
    deliveriesUpdateRequest(state) {
      state.deliveriesDetail.loading = true;
      state.deliveriesDetail.error = null;
    },
    deliveriesUpdateSuccess(state, action) {
      state.deliveriesDetail.loading = false;
      state.deliveriesDetail.data = action.payload?.data || action.payload;
    },
    deliveriesUpdateFailure(state, action) {
      state.deliveriesDetail.loading = false;
      state.deliveriesDetail.error = action.payload;
    },
    deliveriesRemoveRequest(state) {
      state.deliveriesDetail.loading = true;
      state.deliveriesDetail.error = null;
    },
    deliveriesRemoveSuccess(state) {
      state.deliveriesDetail.loading = false;
    },
    deliveriesRemoveFailure(state, action) {
      state.deliveriesDetail.loading = false;
      state.deliveriesDetail.error = action.payload;
    },

    ridersListRequest(state) {
      state.riders.loading = true;
      state.riders.error = null;
    },
    ridersListSuccess(state, action) {
      state.riders.loading = false;
      state.riders.rows = action.payload?.data || [];
      state.riders.meta = action.payload?.meta || state.riders.meta;
    },
    ridersListFailure(state, action) {
      state.riders.loading = false;
      state.riders.error = action.payload;
    },
    ridersGetRequest(state) {
      state.ridersDetail.loading = true;
      state.ridersDetail.error = null;
    },
    ridersGetSuccess(state, action) {
      state.ridersDetail.loading = false;
      state.ridersDetail.data = action.payload?.data || action.payload;
    },
    ridersGetFailure(state, action) {
      state.ridersDetail.loading = false;
      state.ridersDetail.error = action.payload;
    },
    ridersCreateRequest(state) {
      state.ridersDetail.loading = true;
      state.ridersDetail.error = null;
    },
    ridersCreateSuccess(state, action) {
      state.ridersDetail.loading = false;
      state.ridersDetail.data = action.payload?.data || action.payload;
    },
    ridersCreateFailure(state, action) {
      state.ridersDetail.loading = false;
      state.ridersDetail.error = action.payload;
    },
    ridersUpdateRequest(state) {
      state.ridersDetail.loading = true;
      state.ridersDetail.error = null;
    },
    ridersUpdateSuccess(state, action) {
      state.ridersDetail.loading = false;
      state.ridersDetail.data = action.payload?.data || action.payload;
    },
    ridersUpdateFailure(state, action) {
      state.ridersDetail.loading = false;
      state.ridersDetail.error = action.payload;
    },
    ridersRemoveRequest(state) {
      state.ridersDetail.loading = true;
      state.ridersDetail.error = null;
    },
    ridersRemoveSuccess(state) {
      state.ridersDetail.loading = false;
    },
    ridersRemoveFailure(state, action) {
      state.ridersDetail.loading = false;
      state.ridersDetail.error = action.payload;
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
