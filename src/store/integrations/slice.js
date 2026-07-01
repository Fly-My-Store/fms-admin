import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, loading: false, error: null });
const initialEntity = () => ({ data: null, loading: false, error: null });

const initialState = {
  webhookEvents: initialList(),
  webhookEventsDetail: initialEntity(),
  webhookReplay: { loading: false, error: null, data: null },
  paymentOps: { loading: false, error: null, data: null, action: null },
};

const slice = createSlice({
  name: 'admin/integrations',
  initialState,
  reducers: {
    webhookEventsListRequest(state) {
      state.webhookEvents.loading = true;
      state.webhookEvents.error = null;
    },
    webhookEventsListSuccess(state, action) {
      state.webhookEvents.loading = false;
      state.webhookEvents.rows = action.payload?.data || [];
      state.webhookEvents.meta = action.payload?.meta || state.webhookEvents.meta;
    },
    webhookEventsListFailure(state, action) {
      state.webhookEvents.loading = false;
      state.webhookEvents.error = action.payload;
    },
    webhookEventsGetRequest(state) {
      state.webhookEventsDetail.loading = true;
      state.webhookEventsDetail.error = null;
    },
    webhookEventsGetSuccess(state, action) {
      state.webhookEventsDetail.loading = false;
      state.webhookEventsDetail.data = action.payload?.data || action.payload;
    },
    webhookEventsGetFailure(state, action) {
      state.webhookEventsDetail.loading = false;
      state.webhookEventsDetail.error = action.payload;
    },
    webhookEventsCreateRequest(state) {
      state.webhookEventsDetail.loading = true;
      state.webhookEventsDetail.error = null;
    },
    webhookEventsCreateSuccess(state, action) {
      state.webhookEventsDetail.loading = false;
      state.webhookEventsDetail.data = action.payload?.data || action.payload;
    },
    webhookEventsCreateFailure(state, action) {
      state.webhookEventsDetail.loading = false;
      state.webhookEventsDetail.error = action.payload;
    },
    webhookEventsUpdateRequest(state) {
      state.webhookEventsDetail.loading = true;
      state.webhookEventsDetail.error = null;
    },
    webhookEventsUpdateSuccess(state, action) {
      state.webhookEventsDetail.loading = false;
      state.webhookEventsDetail.data = action.payload?.data || action.payload;
    },
    webhookEventsUpdateFailure(state, action) {
      state.webhookEventsDetail.loading = false;
      state.webhookEventsDetail.error = action.payload;
    },
    webhookEventsRemoveRequest(state) {
      state.webhookEventsDetail.loading = true;
      state.webhookEventsDetail.error = null;
    },
    webhookEventsRemoveSuccess(state) {
      state.webhookEventsDetail.loading = false;
    },
    webhookEventsRemoveFailure(state, action) {
      state.webhookEventsDetail.loading = false;
      state.webhookEventsDetail.error = action.payload;
    },
    webhookEventsReplayRequest(state) {
      state.webhookReplay.loading = true;
      state.webhookReplay.error = null;
      state.webhookReplay.data = null;
    },
    webhookEventsReplaySuccess(state, action) {
      state.webhookReplay.loading = false;
      state.webhookReplay.data = action.payload?.data || action.payload;
    },
    webhookEventsReplayFailure(state, action) {
      state.webhookReplay.loading = false;
      state.webhookReplay.error = action.payload;
    },
    paymentOpsRequest(state, action) {
      state.paymentOps.loading = true;
      state.paymentOps.error = null;
      state.paymentOps.data = null;
      state.paymentOps.action = action.payload?.action || null;
    },
    paymentOpsSuccess(state, action) {
      state.paymentOps.loading = false;
      state.paymentOps.data = action.payload?.data || action.payload;
    },
    paymentOpsFailure(state, action) {
      state.paymentOps.loading = false;
      state.paymentOps.error = action.payload;
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
