import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, loading: false, error: null });
const initialEntity = () => ({ data: null, loading: false, error: null });

const initialState = {
  orders: initialList(),
  payments: initialList(),
  refunds: initialList(),
  ordersDetail: initialEntity(),
  paymentsDetail: initialEntity(),
  refundsDetail: initialEntity()
};

const slice = createSlice({
  name: 'admin/ordersPayments',
  initialState,
  reducers: {
    ordersListRequest(state) {
      state.orders.loading = true;
      state.orders.error = null;
    },
    ordersListSuccess(state, action) {
      state.orders.loading = false;
      state.orders.rows = action.payload?.data || [];
      state.orders.meta = action.payload?.meta || state.orders.meta;
    },
    ordersListFailure(state, action) {
      state.orders.loading = false;
      state.orders.error = action.payload;
    },
    ordersGetRequest(state) {
      state.ordersDetail.loading = true;
      state.ordersDetail.error = null;
    },
    ordersGetSuccess(state, action) {
      state.ordersDetail.loading = false;
      state.ordersDetail.data = action.payload?.data || action.payload;
    },
    ordersGetFailure(state, action) {
      state.ordersDetail.loading = false;
      state.ordersDetail.error = action.payload;
    },
    ordersCreateRequest(state) {
      state.ordersDetail.loading = true;
      state.ordersDetail.error = null;
    },
    ordersCreateSuccess(state, action) {
      state.ordersDetail.loading = false;
      state.ordersDetail.data = action.payload?.data || action.payload;
    },
    ordersCreateFailure(state, action) {
      state.ordersDetail.loading = false;
      state.ordersDetail.error = action.payload;
    },
    ordersUpdateRequest(state) {
      state.ordersDetail.loading = true;
      state.ordersDetail.error = null;
    },
    ordersUpdateSuccess(state, action) {
      state.ordersDetail.loading = false;
      state.ordersDetail.data = action.payload?.data || action.payload;
    },
    ordersUpdateFailure(state, action) {
      state.ordersDetail.loading = false;
      state.ordersDetail.error = action.payload;
    },
    ordersRemoveRequest(state) {
      state.ordersDetail.loading = true;
      state.ordersDetail.error = null;
    },
    ordersRemoveSuccess(state) {
      state.ordersDetail.loading = false;
    },
    ordersRemoveFailure(state, action) {
      state.ordersDetail.loading = false;
      state.ordersDetail.error = action.payload;
    },

    paymentsListRequest(state) {
      state.payments.loading = true;
      state.payments.error = null;
    },
    paymentsListSuccess(state, action) {
      state.payments.loading = false;
      state.payments.rows = action.payload?.data || [];
      state.payments.meta = action.payload?.meta || state.payments.meta;
    },
    paymentsListFailure(state, action) {
      state.payments.loading = false;
      state.payments.error = action.payload;
    },
    paymentsGetRequest(state) {
      state.paymentsDetail.loading = true;
      state.paymentsDetail.error = null;
    },
    paymentsGetSuccess(state, action) {
      state.paymentsDetail.loading = false;
      state.paymentsDetail.data = action.payload?.data || action.payload;
    },
    paymentsGetFailure(state, action) {
      state.paymentsDetail.loading = false;
      state.paymentsDetail.error = action.payload;
    },
    paymentsCreateRequest(state) {
      state.paymentsDetail.loading = true;
      state.paymentsDetail.error = null;
    },
    paymentsCreateSuccess(state, action) {
      state.paymentsDetail.loading = false;
      state.paymentsDetail.data = action.payload?.data || action.payload;
    },
    paymentsCreateFailure(state, action) {
      state.paymentsDetail.loading = false;
      state.paymentsDetail.error = action.payload;
    },
    paymentsUpdateRequest(state) {
      state.paymentsDetail.loading = true;
      state.paymentsDetail.error = null;
    },
    paymentsUpdateSuccess(state, action) {
      state.paymentsDetail.loading = false;
      state.paymentsDetail.data = action.payload?.data || action.payload;
    },
    paymentsUpdateFailure(state, action) {
      state.paymentsDetail.loading = false;
      state.paymentsDetail.error = action.payload;
    },
    paymentsRemoveRequest(state) {
      state.paymentsDetail.loading = true;
      state.paymentsDetail.error = null;
    },
    paymentsRemoveSuccess(state) {
      state.paymentsDetail.loading = false;
    },
    paymentsRemoveFailure(state, action) {
      state.paymentsDetail.loading = false;
      state.paymentsDetail.error = action.payload;
    },

    refundsListRequest(state) {
      state.refunds.loading = true;
      state.refunds.error = null;
    },
    refundsListSuccess(state, action) {
      state.refunds.loading = false;
      state.refunds.rows = action.payload?.data || [];
      state.refunds.meta = action.payload?.meta || state.refunds.meta;
    },
    refundsListFailure(state, action) {
      state.refunds.loading = false;
      state.refunds.error = action.payload;
    },
    refundsGetRequest(state) {
      state.refundsDetail.loading = true;
      state.refundsDetail.error = null;
    },
    refundsGetSuccess(state, action) {
      state.refundsDetail.loading = false;
      state.refundsDetail.data = action.payload?.data || action.payload;
    },
    refundsGetFailure(state, action) {
      state.refundsDetail.loading = false;
      state.refundsDetail.error = action.payload;
    },
    refundsCreateRequest(state) {
      state.refundsDetail.loading = true;
      state.refundsDetail.error = null;
    },
    refundsCreateSuccess(state, action) {
      state.refundsDetail.loading = false;
      state.refundsDetail.data = action.payload?.data || action.payload;
    },
    refundsCreateFailure(state, action) {
      state.refundsDetail.loading = false;
      state.refundsDetail.error = action.payload;
    },
    refundsUpdateRequest(state) {
      state.refundsDetail.loading = true;
      state.refundsDetail.error = null;
    },
    refundsUpdateSuccess(state, action) {
      state.refundsDetail.loading = false;
      state.refundsDetail.data = action.payload?.data || action.payload;
    },
    refundsUpdateFailure(state, action) {
      state.refundsDetail.loading = false;
      state.refundsDetail.error = action.payload;
    },
    refundsRemoveRequest(state) {
      state.refundsDetail.loading = true;
      state.refundsDetail.error = null;
    },
    refundsRemoveSuccess(state) {
      state.refundsDetail.loading = false;
    },
    refundsRemoveFailure(state, action) {
      state.refundsDetail.loading = false;
      state.refundsDetail.error = action.payload;
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
