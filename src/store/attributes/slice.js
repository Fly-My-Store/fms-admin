import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, loading: false, error: null });
const initialEntity = () => ({ data: null, loading: false, error: null });

const initialState = {
  defs: initialList(),
  groups: initialList(),
  categoryAttrs: initialList(),
  productAttrs: initialList(),
  variantAttrs: initialList(),
  plpConfigs: initialList(),
  defsDetail: initialEntity(),
  groupsDetail: initialEntity(),
  categoryAttrsDetail: initialEntity(),
  productAttrDetail: initialEntity(),
  variantAttrDetail: initialEntity(),
  plpConfigsDetail: initialEntity()
};

const slice = createSlice({
  name: 'attributes',
  initialState,
  reducers: {
    defsListRequest(state) {
      state.defs.loading = true;
      state.defs.error = null;
    },
    defsListSuccess(state, action) {
      state.defs.loading = false;
      state.defs.rows = action.payload?.data || [];
      state.defs.meta = action.payload?.meta || state.defs.meta;
    },
    defsListFailure(state, action) {
      state.defs.loading = false;
      state.defs.error = action.payload;
    },
    defsGetRequest(state) {
      state.defsDetail.loading = true;
      state.defsDetail.error = null;
    },
    defsGetSuccess(state, action) {
      state.defsDetail.loading = false;
      state.defsDetail.data = action.payload?.data || action.payload;
    },
    defsGetFailure(state, action) {
      state.defsDetail.loading = false;
      state.defsDetail.error = action.payload;
    },
    defsCreateRequest(state) {
      state.defsDetail.loading = true;
      state.defsDetail.error = null;
    },
    defsCreateSuccess(state, action) {
      state.defsDetail.loading = false;
      state.defsDetail.data = action.payload?.data || action.payload;
    },
    defsCreateFailure(state, action) {
      state.defsDetail.loading = false;
      state.defsDetail.error = action.payload;
    },
    defsUpdateRequest(state) {
      state.defsDetail.loading = true;
      state.defsDetail.error = null;
    },
    defsUpdateSuccess(state, action) {
      state.defsDetail.loading = false;
      state.defsDetail.data = action.payload?.data || action.payload;
    },
    defsUpdateFailure(state, action) {
      state.defsDetail.loading = false;
      state.defsDetail.error = action.payload;
    },
    defsRemoveRequest(state) {
      state.defsDetail.loading = true;
      state.defsDetail.error = null;
    },
    defsRemoveSuccess(state) {
      state.defsDetail.loading = false;
    },
    defsRemoveFailure(state, action) {
      state.defsDetail.loading = false;
      state.defsDetail.error = action.payload;
    },

    groupsListRequest(state) {
      state.groups.loading = true;
      state.groups.error = null;
    },
    groupsListSuccess(state, action) {
      state.groups.loading = false;
      state.groups.rows = action.payload?.data || [];
      state.groups.meta = action.payload?.meta || state.groups.meta;
    },
    groupsListFailure(state, action) {
      state.groups.loading = false;
      state.groups.error = action.payload;
    },
    groupsGetRequest(state) {
      state.groupsDetail.loading = true;
      state.groupsDetail.error = null;
    },
    groupsGetSuccess(state, action) {
      state.groupsDetail.loading = false;
      state.groupsDetail.data = action.payload?.data || action.payload;
    },
    groupsGetFailure(state, action) {
      state.groupsDetail.loading = false;
      state.groupsDetail.error = action.payload;
    },
    groupsCreateRequest(state) {
      state.groupsDetail.loading = true;
      state.groupsDetail.error = null;
    },
    groupsCreateSuccess(state, action) {
      state.groupsDetail.loading = false;
      state.groupsDetail.data = action.payload?.data || action.payload;
    },
    groupsCreateFailure(state, action) {
      state.groupsDetail.loading = false;
      state.groupsDetail.error = action.payload;
    },
    groupsUpdateRequest(state) {
      state.groupsDetail.loading = true;
      state.groupsDetail.error = null;
    },
    groupsUpdateSuccess(state, action) {
      state.groupsDetail.loading = false;
      state.groupsDetail.data = action.payload?.data || action.payload;
    },
    groupsUpdateFailure(state, action) {
      state.groupsDetail.loading = false;
      state.groupsDetail.error = action.payload;
    },
    groupsRemoveRequest(state) {
      state.groupsDetail.loading = true;
      state.groupsDetail.error = null;
    },
    groupsRemoveSuccess(state) {
      state.groupsDetail.loading = false;
    },
    groupsRemoveFailure(state, action) {
      state.groupsDetail.loading = false;
      state.groupsDetail.error = action.payload;
    },

    categoryAttrsListRequest(state) {
      state.categoryAttrs.loading = true;
      state.categoryAttrs.error = null;
    },
    categoryAttrsListSuccess(state, action) {
      state.categoryAttrs.loading = false;
      state.categoryAttrs.rows = action.payload?.data || [];
      state.categoryAttrs.meta = action.payload?.meta || state.categoryAttrs.meta;
    },
    categoryAttrsListFailure(state, action) {
      state.categoryAttrs.loading = false;
      state.categoryAttrs.error = action.payload;
    },
    categoryAttrsGetRequest(state) {
      state.categoryAttrsDetail.loading = true;
      state.categoryAttrsDetail.error = null;
    },
    categoryAttrsGetSuccess(state, action) {
      state.categoryAttrsDetail.loading = false;
      state.categoryAttrsDetail.data = action.payload?.data || action.payload;
    },
    categoryAttrsGetFailure(state, action) {
      state.categoryAttrsDetail.loading = false;
      state.categoryAttrsDetail.error = action.payload;
    },
    categoryAttrsCreateRequest(state) {
      state.categoryAttrsDetail.loading = true;
      state.categoryAttrsDetail.error = null;
    },
    categoryAttrsCreateSuccess(state, action) {
      state.categoryAttrsDetail.loading = false;
      state.categoryAttrsDetail.data = action.payload?.data || action.payload;
    },
    categoryAttrsCreateFailure(state, action) {
      state.categoryAttrsDetail.loading = false;
      state.categoryAttrsDetail.error = action.payload;
    },
    categoryAttrsUpdateRequest(state) {
      state.categoryAttrsDetail.loading = true;
      state.categoryAttrsDetail.error = null;
    },
    categoryAttrsUpdateSuccess(state, action) {
      state.categoryAttrsDetail.loading = false;
      state.categoryAttrsDetail.data = action.payload?.data || action.payload;
    },
    categoryAttrsUpdateFailure(state, action) {
      state.categoryAttrsDetail.loading = false;
      state.categoryAttrsDetail.error = action.payload;
    },
    categoryAttrsRemoveRequest(state) {
      state.categoryAttrsDetail.loading = true;
      state.categoryAttrsDetail.error = null;
    },
    categoryAttrsRemoveSuccess(state) {
      state.categoryAttrsDetail.loading = false;
    },
    categoryAttrsRemoveFailure(state, action) {
      state.categoryAttrsDetail.loading = false;
      state.categoryAttrsDetail.error = action.payload;
    },

    plpConfigsListRequest(state) {
      state.plpConfigs.loading = true;
      state.plpConfigs.error = null;
    },
    plpConfigsListSuccess(state, action) {
      state.plpConfigs.loading = false;
      state.plpConfigs.rows = action.payload?.data || [];
      state.plpConfigs.meta = action.payload?.meta || state.plpConfigs.meta;
    },
    plpConfigsListFailure(state, action) {
      state.plpConfigs.loading = false;
      state.plpConfigs.error = action.payload;
    },
    plpConfigsGetRequest(state) {
      state.plpConfigsDetail.loading = true;
      state.plpConfigsDetail.error = null;
    },
    plpConfigsGetSuccess(state, action) {
      state.plpConfigsDetail.loading = false;
      state.plpConfigsDetail.data = action.payload?.data || action.payload;
    },
    plpConfigsGetFailure(state, action) {
      state.plpConfigsDetail.loading = false;
      state.plpConfigsDetail.error = action.payload;
    },
    plpConfigsCreateRequest(state) {
      state.plpConfigsDetail.loading = true;
      state.plpConfigsDetail.error = null;
    },
    plpConfigsCreateSuccess(state, action) {
      state.plpConfigsDetail.loading = false;
      state.plpConfigsDetail.data = action.payload?.data || action.payload;
    },
    plpConfigsCreateFailure(state, action) {
      state.plpConfigsDetail.loading = false;
      state.plpConfigsDetail.error = action.payload;
    },
    plpConfigsUpdateRequest(state) {
      state.plpConfigsDetail.loading = true;
      state.plpConfigsDetail.error = null;
    },
    plpConfigsUpdateSuccess(state, action) {
      state.plpConfigsDetail.loading = false;
      state.plpConfigsDetail.data = action.payload?.data || action.payload;
    },
    plpConfigsUpdateFailure(state, action) {
      state.plpConfigsDetail.loading = false;
      state.plpConfigsDetail.error = action.payload;
    },
    plpConfigsRemoveRequest(state) {
      state.plpConfigsDetail.loading = true;
      state.plpConfigsDetail.error = null;
    },
    plpConfigsRemoveSuccess(state) {
      state.plpConfigsDetail.loading = false;
    },
    plpConfigsRemoveFailure(state, action) {
      state.plpConfigsDetail.loading = false;
      state.plpConfigsDetail.error = action.payload;
    },
    productAttrsListRequest(state) {
      state.productAttrs.loading = true;
      state.productAttrs.error = null;
    },
    productAttrsListSuccess(state, action) {
      state.productAttrs.loading = false;
      state.productAttrs.rows = action.payload?.data || [];
      state.productAttrs.meta = action.payload?.meta || state.productAttrs.meta;
    },
    productAttrsListFailure(state, action) {
      state.productAttrs.loading = false;
      state.productAttrs.error = action.payload;
    },
    productAttrGetRequest(state) {
      state.productAttrDetail.loading = true;
      state.productAttrDetail.error = null;
    },
    productAttrGetSuccess(state, action) {
      state.productAttrDetail.loading = false;
      state.productAttrDetail.data = action.payload?.data || action.payload;
    },
    productAttrGetFailure(state, action) {
      state.productAttrDetail.loading = false;
      state.productAttrDetail.error = action.payload;
    },
    productAttrUpsertRequest(state) {
      state.productAttrDetail.loading = true;
      state.productAttrDetail.error = null;
    },
    productAttrUpsertSuccess(state, action) {
      state.productAttrDetail.loading = false;
      state.productAttrDetail.data = action.payload?.data || action.payload;
    },
    productAttrUpsertFailure(state, action) {
      state.productAttrDetail.loading = false;
      state.productAttrDetail.error = action.payload;
    },

    variantAttrsListRequest(state) {
      state.variantAttrs.loading = true;
      state.variantAttrs.error = null;
    },
    variantAttrsListSuccess(state, action) {
      state.variantAttrs.loading = false;
      state.variantAttrs.rows = action.payload?.data || [];
      state.variantAttrs.meta = action.payload?.meta || state.variantAttrs.meta;
    },
    variantAttrsListFailure(state, action) {
      state.variantAttrs.loading = false;
      state.variantAttrs.error = action.payload;
    },
    variantAttrGetRequest(state) {
      state.variantAttrDetail.loading = true;
      state.variantAttrDetail.error = null;
    },
    variantAttrGetSuccess(state, action) {
      state.variantAttrDetail.loading = false;
      state.variantAttrDetail.data = action.payload?.data || action.payload;
    },
    variantAttrGetFailure(state, action) {
      state.variantAttrDetail.loading = false;
      state.variantAttrDetail.error = action.payload;
    },
    variantAttrUpsertRequest(state) {
      state.variantAttrDetail.loading = true;
      state.variantAttrDetail.error = null;
    },
    variantAttrUpsertSuccess(state, action) {
      state.variantAttrDetail.loading = false;
      state.variantAttrDetail.data = action.payload?.data || action.payload;
    },
    variantAttrUpsertFailure(state, action) {
      state.variantAttrDetail.loading = false;
      state.variantAttrDetail.error = action.payload;
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
