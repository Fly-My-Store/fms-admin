import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, loading: false, error: null });
const initialEntity = () => ({ data: null, loading: false, error: null });

const initialState = {
  defs: initialList(),
  groups: initialList(),
  categoryAttrs: initialList(),
  plpConfigs: initialList(),
  defsDetail: initialEntity(),
  groupsDetail: initialEntity(),
  categoryAttrsDetail: initialEntity(),
  plpConfigsDetail: initialEntity()
};

const slice = createSlice({
  name: 'admin/attributes',
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
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
