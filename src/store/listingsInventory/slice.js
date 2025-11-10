import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, loading: false, error: null });
const initialEntity = () => ({ data: null, loading: false, error: null });

const initialState = {
  storeProducts: initialList(),
  storeVariants: initialList(),
  inventoryMovements: initialList(),
  storeProductsDetail: initialEntity(),
  storeVariantsDetail: initialEntity(),
  inventoryMovementsDetail: initialEntity()
};

const slice = createSlice({
  name: 'admin/listingsInventory',
  initialState,
  reducers: {
    storeProductsListRequest(state) {
      state.storeProducts.loading = true;
      state.storeProducts.error = null;
    },
    storeProductsListSuccess(state, action) {
      state.storeProducts.loading = false;
      state.storeProducts.rows = action.payload?.data || [];
      state.storeProducts.meta = action.payload?.meta || state.storeProducts.meta;
    },
    storeProductsListFailure(state, action) {
      state.storeProducts.loading = false;
      state.storeProducts.error = action.payload;
    },
    storeProductsGetRequest(state) {
      state.storeProductsDetail.loading = true;
      state.storeProductsDetail.error = null;
    },
    storeProductsGetSuccess(state, action) {
      state.storeProductsDetail.loading = false;
      state.storeProductsDetail.data = action.payload?.data || action.payload;
    },
    storeProductsGetFailure(state, action) {
      state.storeProductsDetail.loading = false;
      state.storeProductsDetail.error = action.payload;
    },
    storeProductsCreateRequest(state) {
      state.storeProductsDetail.loading = true;
      state.storeProductsDetail.error = null;
    },
    storeProductsCreateSuccess(state, action) {
      state.storeProductsDetail.loading = false;
      state.storeProductsDetail.data = action.payload?.data || action.payload;
    },
    storeProductsCreateFailure(state, action) {
      state.storeProductsDetail.loading = false;
      state.storeProductsDetail.error = action.payload;
    },
    storeProductsUpdateRequest(state) {
      state.storeProductsDetail.loading = true;
      state.storeProductsDetail.error = null;
    },
    storeProductsUpdateSuccess(state, action) {
      state.storeProductsDetail.loading = false;
      state.storeProductsDetail.data = action.payload?.data || action.payload;
    },
    storeProductsUpdateFailure(state, action) {
      state.storeProductsDetail.loading = false;
      state.storeProductsDetail.error = action.payload;
    },
    storeProductsRemoveRequest(state) {
      state.storeProductsDetail.loading = true;
      state.storeProductsDetail.error = null;
    },
    storeProductsRemoveSuccess(state) {
      state.storeProductsDetail.loading = false;
    },
    storeProductsRemoveFailure(state, action) {
      state.storeProductsDetail.loading = false;
      state.storeProductsDetail.error = action.payload;
    },

    storeVariantsListRequest(state) {
      state.storeVariants.loading = true;
      state.storeVariants.error = null;
    },
    storeVariantsListSuccess(state, action) {
      state.storeVariants.loading = false;
      state.storeVariants.rows = action.payload?.data || [];
      state.storeVariants.meta = action.payload?.meta || state.storeVariants.meta;
    },
    storeVariantsListFailure(state, action) {
      state.storeVariants.loading = false;
      state.storeVariants.error = action.payload;
    },
    storeVariantsGetRequest(state) {
      state.storeVariantsDetail.loading = true;
      state.storeVariantsDetail.error = null;
    },
    storeVariantsGetSuccess(state, action) {
      state.storeVariantsDetail.loading = false;
      state.storeVariantsDetail.data = action.payload?.data || action.payload;
    },
    storeVariantsGetFailure(state, action) {
      state.storeVariantsDetail.loading = false;
      state.storeVariantsDetail.error = action.payload;
    },
    storeVariantsCreateRequest(state) {
      state.storeVariantsDetail.loading = true;
      state.storeVariantsDetail.error = null;
    },
    storeVariantsCreateSuccess(state, action) {
      state.storeVariantsDetail.loading = false;
      state.storeVariantsDetail.data = action.payload?.data || action.payload;
    },
    storeVariantsCreateFailure(state, action) {
      state.storeVariantsDetail.loading = false;
      state.storeVariantsDetail.error = action.payload;
    },
    storeVariantsUpdateRequest(state) {
      state.storeVariantsDetail.loading = true;
      state.storeVariantsDetail.error = null;
    },
    storeVariantsUpdateSuccess(state, action) {
      state.storeVariantsDetail.loading = false;
      state.storeVariantsDetail.data = action.payload?.data || action.payload;
    },
    storeVariantsUpdateFailure(state, action) {
      state.storeVariantsDetail.loading = false;
      state.storeVariantsDetail.error = action.payload;
    },
    storeVariantsRemoveRequest(state) {
      state.storeVariantsDetail.loading = true;
      state.storeVariantsDetail.error = null;
    },
    storeVariantsRemoveSuccess(state) {
      state.storeVariantsDetail.loading = false;
    },
    storeVariantsRemoveFailure(state, action) {
      state.storeVariantsDetail.loading = false;
      state.storeVariantsDetail.error = action.payload;
    },

    inventoryMovementsListRequest(state) {
      state.inventoryMovements.loading = true;
      state.inventoryMovements.error = null;
    },
    inventoryMovementsListSuccess(state, action) {
      state.inventoryMovements.loading = false;
      state.inventoryMovements.rows = action.payload?.data || [];
      state.inventoryMovements.meta = action.payload?.meta || state.inventoryMovements.meta;
    },
    inventoryMovementsListFailure(state, action) {
      state.inventoryMovements.loading = false;
      state.inventoryMovements.error = action.payload;
    },
    inventoryMovementsGetRequest(state) {
      state.inventoryMovementsDetail.loading = true;
      state.inventoryMovementsDetail.error = null;
    },
    inventoryMovementsGetSuccess(state, action) {
      state.inventoryMovementsDetail.loading = false;
      state.inventoryMovementsDetail.data = action.payload?.data || action.payload;
    },
    inventoryMovementsGetFailure(state, action) {
      state.inventoryMovementsDetail.loading = false;
      state.inventoryMovementsDetail.error = action.payload;
    },
    inventoryMovementsCreateRequest(state) {
      state.inventoryMovementsDetail.loading = true;
      state.inventoryMovementsDetail.error = null;
    },
    inventoryMovementsCreateSuccess(state, action) {
      state.inventoryMovementsDetail.loading = false;
      state.inventoryMovementsDetail.data = action.payload?.data || action.payload;
    },
    inventoryMovementsCreateFailure(state, action) {
      state.inventoryMovementsDetail.loading = false;
      state.inventoryMovementsDetail.error = action.payload;
    },
    inventoryMovementsUpdateRequest(state) {
      state.inventoryMovementsDetail.loading = true;
      state.inventoryMovementsDetail.error = null;
    },
    inventoryMovementsUpdateSuccess(state, action) {
      state.inventoryMovementsDetail.loading = false;
      state.inventoryMovementsDetail.data = action.payload?.data || action.payload;
    },
    inventoryMovementsUpdateFailure(state, action) {
      state.inventoryMovementsDetail.loading = false;
      state.inventoryMovementsDetail.error = action.payload;
    },
    inventoryMovementsRemoveRequest(state) {
      state.inventoryMovementsDetail.loading = true;
      state.inventoryMovementsDetail.error = null;
    },
    inventoryMovementsRemoveSuccess(state) {
      state.inventoryMovementsDetail.loading = false;
    },
    inventoryMovementsRemoveFailure(state, action) {
      state.inventoryMovementsDetail.loading = false;
      state.inventoryMovementsDetail.error = action.payload;
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
