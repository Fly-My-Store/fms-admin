import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, loading: false, error: null });
const initialEntity = () => ({ data: null, loading: false, error: null });

const initialState = {
  audits: initialList(),
  auditsDetail: initialEntity()
};

const slice = createSlice({
  name: 'admin/audit',
  initialState,
  reducers: {
    auditsListRequest(state) {
      state.audits.loading = true;
      state.audits.error = null;
    },
    auditsListSuccess(state, action) {
      state.audits.loading = false;
      state.audits.rows = action.payload?.data || [];
      state.audits.meta = action.payload?.meta || state.audits.meta;
    },
    auditsListFailure(state, action) {
      state.audits.loading = false;
      state.audits.error = action.payload;
    },
    auditsGetRequest(state) {
      state.auditsDetail.loading = true;
      state.auditsDetail.error = null;
    },
    auditsGetSuccess(state, action) {
      state.auditsDetail.loading = false;
      state.auditsDetail.data = action.payload?.data || action.payload;
    },
    auditsGetFailure(state, action) {
      state.auditsDetail.loading = false;
      state.auditsDetail.error = action.payload;
    },
    auditsCreateRequest(state) {
      state.auditsDetail.loading = true;
      state.auditsDetail.error = null;
    },
    auditsCreateSuccess(state, action) {
      state.auditsDetail.loading = false;
      state.auditsDetail.data = action.payload?.data || action.payload;
    },
    auditsCreateFailure(state, action) {
      state.auditsDetail.loading = false;
      state.auditsDetail.error = action.payload;
    },
    auditsUpdateRequest(state) {
      state.auditsDetail.loading = true;
      state.auditsDetail.error = null;
    },
    auditsUpdateSuccess(state, action) {
      state.auditsDetail.loading = false;
      state.auditsDetail.data = action.payload?.data || action.payload;
    },
    auditsUpdateFailure(state, action) {
      state.auditsDetail.loading = false;
      state.auditsDetail.error = action.payload;
    },
    auditsRemoveRequest(state) {
      state.auditsDetail.loading = true;
      state.auditsDetail.error = null;
    },
    auditsRemoveSuccess(state) {
      state.auditsDetail.loading = false;
    },
    auditsRemoveFailure(state, action) {
      state.auditsDetail.loading = false;
      state.auditsDetail.error = action.payload;
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
