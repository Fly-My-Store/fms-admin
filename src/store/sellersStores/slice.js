import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, loading: false, error: null });
const initialEntity = () => ({ data: null, loading: false, error: null });

const initialState = {
  sellers: initialList(),
  stores: initialList(),
  sellersDetail: initialEntity(),
  storeDetail: initialEntity()
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
      state.storeDetail.loading = true;
      state.storeDetail.error = null;
      state.storeDetail.data = null;
    },
    storesGetSuccess(state, action) {
      state.storeDetail.loading = false;
      state.storeDetail.data = action.payload?.data || action.payload;
    },
    storesGetFailure(state, action) {
      state.storeDetail.loading = false;
      state.storeDetail.error = action.payload;
    },
    storesCreateRequest(state) {
      state.storeDetail.loading = true;
      state.storeDetail.error = null;
    },
    storesCreateSuccess(state, action) {
      state.storeDetail.loading = false;
      state.storeDetail.data = action.payload?.data || action.payload;
    },
    storesCreateFailure(state, action) {
      state.storeDetail.loading = false;
      state.storeDetail.error = action.payload;
    },
    storesUpdateRequest(state) {
      state.storeDetail.loading = true;
      state.storeDetail.error = null;
    },
    storesUpdateSuccess(state, action) {
      state.storeDetail.loading = false;
      state.storeDetail.data = action.payload?.data || action.payload;
    },
    storesUpdateFailure(state, action) {
      state.storeDetail.loading = false;
      state.storeDetail.error = action.payload;
    },
    /** Optimistic / post-PATCH update of is_open on the list row (and detail if same id). */
    storesSetOpenLocal(state, action) {
      const { id, is_open } = action.payload || {};
      if (!id) return;
      const rows = state.stores.rows || [];
      const idx = rows.findIndex((r) => r.id === id);
      if (idx >= 0) {
        rows[idx] = { ...rows[idx], is_open: Boolean(is_open) };
      }
      if (state.storeDetail.data?.id === id) {
        state.storeDetail.data = { ...state.storeDetail.data, is_open: Boolean(is_open) };
      }
    },
    storesRemoveRequest(state) {
      state.storeDetail.loading = true;
      state.storeDetail.error = null;
    },
    storesRemoveSuccess(state) {
      state.storeDetail.loading = false;
    },
    storesRemoveFailure(state, action) {
      state.storeDetail.loading = false;
      state.storeDetail.error = action.payload;
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
