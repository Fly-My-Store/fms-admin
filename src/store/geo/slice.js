import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, loading: false, error: null });
const initialEntity = () => ({ data: null, loading: false, error: null });

const initialState = {
  pincodes: initialList(),
  addresses: initialList(),
  pincodesDetail: initialEntity(),
  addressesDetail: initialEntity()
};

const slice = createSlice({
  name: 'admin/geo',
  initialState,
  reducers: {
    pincodesListRequest(state) {
      state.pincodes.loading = true;
      state.pincodes.error = null;
    },
    pincodesListSuccess(state, action) {
      state.pincodes.loading = false;
      state.pincodes.rows = action.payload?.data || [];
      state.pincodes.meta = action.payload?.meta || state.pincodes.meta;
    },
    pincodesListFailure(state, action) {
      state.pincodes.loading = false;
      state.pincodes.error = action.payload;
    },
    pincodesGetRequest(state) {
      state.pincodesDetail.loading = true;
      state.pincodesDetail.error = null;
    },
    pincodesGetSuccess(state, action) {
      state.pincodesDetail.loading = false;
      state.pincodesDetail.data = action.payload?.data || action.payload;
    },
    pincodesGetFailure(state, action) {
      state.pincodesDetail.loading = false;
      state.pincodesDetail.error = action.payload;
    },
    pincodesCreateRequest(state) {
      state.pincodesDetail.loading = true;
      state.pincodesDetail.error = null;
    },
    pincodesCreateSuccess(state, action) {
      state.pincodesDetail.loading = false;
      state.pincodesDetail.data = action.payload?.data || action.payload;
    },
    pincodesCreateFailure(state, action) {
      state.pincodesDetail.loading = false;
      state.pincodesDetail.error = action.payload;
    },
    pincodesUpdateRequest(state) {
      state.pincodesDetail.loading = true;
      state.pincodesDetail.error = null;
    },
    pincodesUpdateSuccess(state, action) {
      state.pincodesDetail.loading = false;
      state.pincodesDetail.data = action.payload?.data || action.payload;
    },
    pincodesUpdateFailure(state, action) {
      state.pincodesDetail.loading = false;
      state.pincodesDetail.error = action.payload;
    },
    pincodesRemoveRequest(state) {
      state.pincodesDetail.loading = true;
      state.pincodesDetail.error = null;
    },
    pincodesRemoveSuccess(state) {
      state.pincodesDetail.loading = false;
    },
    pincodesRemoveFailure(state, action) {
      state.pincodesDetail.loading = false;
      state.pincodesDetail.error = action.payload;
    },

    addressesListRequest(state) {
      state.addresses.loading = true;
      state.addresses.error = null;
    },
    addressesListSuccess(state, action) {
      state.addresses.loading = false;
      state.addresses.rows = action.payload?.data || [];
      state.addresses.meta = action.payload?.meta || state.addresses.meta;
    },
    addressesListFailure(state, action) {
      state.addresses.loading = false;
      state.addresses.error = action.payload;
    },
    addressesGetRequest(state) {
      state.addressesDetail.loading = true;
      state.addressesDetail.error = null;
    },
    addressesGetSuccess(state, action) {
      state.addressesDetail.loading = false;
      state.addressesDetail.data = action.payload?.data || action.payload;
    },
    addressesGetFailure(state, action) {
      state.addressesDetail.loading = false;
      state.addressesDetail.error = action.payload;
    },
    addressesCreateRequest(state) {
      state.addressesDetail.loading = true;
      state.addressesDetail.error = null;
    },
    addressesCreateSuccess(state, action) {
      state.addressesDetail.loading = false;
      state.addressesDetail.data = action.payload?.data || action.payload;
    },
    addressesCreateFailure(state, action) {
      state.addressesDetail.loading = false;
      state.addressesDetail.error = action.payload;
    },
    addressesUpdateRequest(state) {
      state.addressesDetail.loading = true;
      state.addressesDetail.error = null;
    },
    addressesUpdateSuccess(state, action) {
      state.addressesDetail.loading = false;
      state.addressesDetail.data = action.payload?.data || action.payload;
    },
    addressesUpdateFailure(state, action) {
      state.addressesDetail.loading = false;
      state.addressesDetail.error = action.payload;
    },
    addressesRemoveRequest(state) {
      state.addressesDetail.loading = true;
      state.addressesDetail.error = null;
    },
    addressesRemoveSuccess(state) {
      state.addressesDetail.loading = false;
    },
    addressesRemoveFailure(state, action) {
      state.addressesDetail.loading = false;
      state.addressesDetail.error = action.payload;
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
