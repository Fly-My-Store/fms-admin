import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], count: 0, page: 1, pageSize: 10, totalPages: 1, loading: false, error: null });
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
      state.defs.count = action.payload?.count || 0;
      state.defs.page = action.payload?.page || 1;
      state.defs.pageSize = action.payload?.pageSize || 10;
      state.defs.totalPages = action.payload?.totalPages || [];
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
      state.groups.count = action.payload?.count || 0;
      state.groups.page = action.payload?.page || 1;
      state.groups.pageSize = action.payload?.pageSize || 10;
      state.groups.totalPages = action.payload?.totalPages || [];
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
      state.categoryAttrs.count = action.payload?.count || 0;
      state.categoryAttrs.page = action.payload?.page || 1;
      state.categoryAttrs.pageSize = action.payload?.pageSize || 10;
      state.categoryAttrs.totalPages = action.payload?.totalPages || [];
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
      const row = action.payload?.data || action.payload;
      state.categoryAttrsDetail.data = row;
      if (row?.attribute_code && !state.categoryAttrs.rows.some((r) => r.attribute_code === row.attribute_code)) {
        state.categoryAttrs.rows = [row, ...state.categoryAttrs.rows];
        state.categoryAttrs.count += 1;
      }
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
    categoryAttrsRemoveSuccess(state, action) {
      state.categoryAttrsDetail.loading = false;
      const code = action.payload?.attribute_code;
      if (code) {
        state.categoryAttrs.rows = state.categoryAttrs.rows.filter((r) => r.attribute_code !== code);
        state.categoryAttrs.count = Math.max(0, state.categoryAttrs.count - 1);
      }
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
      state.plpConfigs.count = action.payload?.count || 0;
      state.plpConfigs.page = action.payload?.page || 1;
      state.plpConfigs.pageSize = action.payload?.pageSize || 10;
      state.plpConfigs.totalPages = action.payload?.totalPages || [];
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
      state.productAttrs.count = action.payload?.count || 0;
      state.productAttrs.page = action.payload?.page || 1;
      state.productAttrs.pageSize = action.payload?.pageSize || 10;
      state.productAttrs.totalPages = action.payload?.totalPages || [];
    },
    productAttrsListFailure(state, action) {
      state.productAttrs.loading = false;
      state.productAttrs.error = action.payload;
    },
    productAttrGetRequest(state) {
      state.productAttrDetail.loading = true;
      state.productAttrDetail.error = null;
      state.productAttrDetail.data = initialEntity().data;
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
      state.variantAttrs.count = action.payload?.count || 0;
      state.variantAttrs.page = action.payload?.page || 1;
      state.variantAttrs.pageSize = action.payload?.pageSize || 10;
      state.variantAttrs.totalPages = action.payload?.totalPages || [];
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
