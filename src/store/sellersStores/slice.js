import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, loading: false, error: null });
const initialEntity = () => ({ data: null, loading: false, error: null });

const initialState = {
  sellers: initialList(),
  stores: initialList(),
  sellersDetail: initialEntity(),
  storesDetail: initialEntity()
};

const slice = createSlice({
  name: 'admin/sellersStores',
  initialState,
  reducers: {
    sellersListRequest(state) {
      state.sellers.loading = true;
      state.sellers.error = null;
    },
    sellersListSuccess(state, action) {
      state.sellers.loading = false;
      state.sellers.rows = action.payload?.data || [];
      state.sellers.meta = action.payload?.meta || state.sellers.meta;
    },
    sellersListFailure(state, action) {
      state.sellers.loading = false;
      state.sellers.error = action.payload;
    },
    sellersGetRequest(state) {
      state.sellersDetail.loading = true;
      state.sellersDetail.error = null;
    },
    sellersGetSuccess(state, action) {
      state.sellersDetail.loading = false;
      state.sellersDetail.data = action.payload?.data || action.payload;
    },
    sellersGetFailure(state, action) {
      state.sellersDetail.loading = false;
      state.sellersDetail.error = action.payload;
    },
    sellersCreateRequest(state) {
      state.sellersDetail.loading = true;
      state.sellersDetail.error = null;
    },
    sellersCreateSuccess(state, action) {
      state.sellersDetail.loading = false;
      state.sellersDetail.data = action.payload?.data || action.payload;
    },
    sellersCreateFailure(state, action) {
      state.sellersDetail.loading = false;
      state.sellersDetail.error = action.payload;
    },
    sellersUpdateRequest(state) {
      state.sellersDetail.loading = true;
      state.sellersDetail.error = null;
    },
    sellersUpdateSuccess(state, action) {
      state.sellersDetail.loading = false;
      state.sellersDetail.data = action.payload?.data || action.payload;
    },
    sellersUpdateFailure(state, action) {
      state.sellersDetail.loading = false;
      state.sellersDetail.error = action.payload;
    },
    sellersRemoveRequest(state) {
      state.sellersDetail.loading = true;
      state.sellersDetail.error = null;
    },
    sellersRemoveSuccess(state) {
      state.sellersDetail.loading = false;
    },
    sellersRemoveFailure(state, action) {
      state.sellersDetail.loading = false;
      state.sellersDetail.error = action.payload;
    },

    storesListRequest(state) {
      state.stores.loading = true;
      state.stores.error = null;
    },
    storesListSuccess(state, action) {
      state.stores.loading = false;
      state.stores.rows = action.payload?.data || [];
      state.stores.meta = action.payload?.meta || state.stores.meta;
    },
    storesListFailure(state, action) {
      state.stores.loading = false;
      state.stores.error = action.payload;
    },
    storesGetRequest(state) {
      state.storesDetail.loading = true;
      state.storesDetail.error = null;
    },
    storesGetSuccess(state, action) {
      state.storesDetail.loading = false;
      state.storesDetail.data = action.payload?.data || action.payload;
    },
    storesGetFailure(state, action) {
      state.storesDetail.loading = false;
      state.storesDetail.error = action.payload;
    },
    storesCreateRequest(state) {
      state.storesDetail.loading = true;
      state.storesDetail.error = null;
    },
    storesCreateSuccess(state, action) {
      state.storesDetail.loading = false;
      state.storesDetail.data = action.payload?.data || action.payload;
    },
    storesCreateFailure(state, action) {
      state.storesDetail.loading = false;
      state.storesDetail.error = action.payload;
    },
    storesUpdateRequest(state) {
      state.storesDetail.loading = true;
      state.storesDetail.error = null;
    },
    storesUpdateSuccess(state, action) {
      state.storesDetail.loading = false;
      state.storesDetail.data = action.payload?.data || action.payload;
    },
    storesUpdateFailure(state, action) {
      state.storesDetail.loading = false;
      state.storesDetail.error = action.payload;
    },
    storesRemoveRequest(state) {
      state.storesDetail.loading = true;
      state.storesDetail.error = null;
    },
    storesRemoveSuccess(state) {
      state.storesDetail.loading = false;
    },
    storesRemoveFailure(state, action) {
      state.storesDetail.loading = false;
      state.storesDetail.error = action.payload;
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
