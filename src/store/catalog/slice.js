import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, loading: false, error: null });
const initialEntity = () => ({ data: null, loading: false, error: null });

const initialState = {
  brands: initialList(),
  categories: initialList(),
  products: initialList(),
  brandsDetail: initialEntity(),
  categoriesDetail: initialEntity(),
  productsDetail: initialEntity()
};

const slice = createSlice({
  name: 'admin/catalog',
  initialState,
  reducers: {
    brandsListRequest(state) {
      state.brands.loading = true;
      state.brands.error = null;
    },
    brandsListSuccess(state, action) {
      state.brands.loading = false;
      state.brands.rows = action.payload?.data || [];
      state.brands.meta = action.payload?.meta || state.brands.meta;
    },
    brandsListFailure(state, action) {
      state.brands.loading = false;
      state.brands.error = action.payload;
    },
    brandsGetRequest(state) {
      state.brandsDetail.loading = true;
      state.brandsDetail.error = null;
    },
    brandsGetSuccess(state, action) {
      state.brandsDetail.loading = false;
      state.brandsDetail.data = action.payload?.data || action.payload;
    },
    brandsGetFailure(state, action) {
      state.brandsDetail.loading = false;
      state.brandsDetail.error = action.payload;
    },
    brandsCreateRequest(state) {
      state.brandsDetail.loading = true;
      state.brandsDetail.error = null;
    },
    brandsCreateSuccess(state, action) {
      state.brandsDetail.loading = false;
      state.brandsDetail.data = action.payload?.data || action.payload;
    },
    brandsCreateFailure(state, action) {
      state.brandsDetail.loading = false;
      state.brandsDetail.error = action.payload;
    },
    brandsUpdateRequest(state) {
      state.brandsDetail.loading = true;
      state.brandsDetail.error = null;
    },
    brandsUpdateSuccess(state, action) {
      state.brandsDetail.loading = false;
      state.brandsDetail.data = action.payload?.data || action.payload;
    },
    brandsUpdateFailure(state, action) {
      state.brandsDetail.loading = false;
      state.brandsDetail.error = action.payload;
    },
    brandsRemoveRequest(state) {
      state.brandsDetail.loading = true;
      state.brandsDetail.error = null;
    },
    brandsRemoveSuccess(state) {
      state.brandsDetail.loading = false;
    },
    brandsRemoveFailure(state, action) {
      state.brandsDetail.loading = false;
      state.brandsDetail.error = action.payload;
    },

    categoriesListRequest(state) {
      state.categories.loading = true;
      state.categories.error = null;
    },
    categoriesListSuccess(state, action) {
      state.categories.loading = false;
      state.categories.rows = action.payload?.data || [];
      state.categories.meta = action.payload?.meta || state.categories.meta;
    },
    categoriesListFailure(state, action) {
      state.categories.loading = false;
      state.categories.error = action.payload;
    },
    categoriesGetRequest(state) {
      state.categoriesDetail.loading = true;
      state.categoriesDetail.error = null;
    },
    categoriesGetSuccess(state, action) {
      state.categoriesDetail.loading = false;
      state.categoriesDetail.data = action.payload?.data || action.payload;
    },
    categoriesGetFailure(state, action) {
      state.categoriesDetail.loading = false;
      state.categoriesDetail.error = action.payload;
    },
    categoriesCreateRequest(state) {
      state.categoriesDetail.loading = true;
      state.categoriesDetail.error = null;
    },
    categoriesCreateSuccess(state, action) {
      state.categoriesDetail.loading = false;
      state.categoriesDetail.data = action.payload?.data || action.payload;
    },
    categoriesCreateFailure(state, action) {
      state.categoriesDetail.loading = false;
      state.categoriesDetail.error = action.payload;
    },
    categoriesUpdateRequest(state) {
      state.categoriesDetail.loading = true;
      state.categoriesDetail.error = null;
    },
    categoriesUpdateSuccess(state, action) {
      state.categoriesDetail.loading = false;
      state.categoriesDetail.data = action.payload?.data || action.payload;
    },
    categoriesUpdateFailure(state, action) {
      state.categoriesDetail.loading = false;
      state.categoriesDetail.error = action.payload;
    },
    categoriesRemoveRequest(state) {
      state.categoriesDetail.loading = true;
      state.categoriesDetail.error = null;
    },
    categoriesRemoveSuccess(state) {
      state.categoriesDetail.loading = false;
    },
    categoriesRemoveFailure(state, action) {
      state.categoriesDetail.loading = false;
      state.categoriesDetail.error = action.payload;
    },

    productsListRequest(state) {
      state.products.loading = true;
      state.products.error = null;
    },
    productsListSuccess(state, action) {
      state.products.loading = false;
      state.products.rows = action.payload?.data || [];
      state.products.meta = action.payload?.meta || state.products.meta;
    },
    productsListFailure(state, action) {
      state.products.loading = false;
      state.products.error = action.payload;
    },
    productsGetRequest(state) {
      state.productsDetail.loading = true;
      state.productsDetail.error = null;
    },
    productsGetSuccess(state, action) {
      state.productsDetail.loading = false;
      state.productsDetail.data = action.payload?.data || action.payload;
    },
    productsGetFailure(state, action) {
      state.productsDetail.loading = false;
      state.productsDetail.error = action.payload;
    },
    productsCreateRequest(state) {
      state.productsDetail.loading = true;
      state.productsDetail.error = null;
    },
    productsCreateSuccess(state, action) {
      state.productsDetail.loading = false;
      state.productsDetail.data = action.payload?.data || action.payload;
    },
    productsCreateFailure(state, action) {
      state.productsDetail.loading = false;
      state.productsDetail.error = action.payload;
    },
    productsUpdateRequest(state) {
      state.productsDetail.loading = true;
      state.productsDetail.error = null;
    },
    productsUpdateSuccess(state, action) {
      state.productsDetail.loading = false;
      state.productsDetail.data = action.payload?.data || action.payload;
    },
    productsUpdateFailure(state, action) {
      state.productsDetail.loading = false;
      state.productsDetail.error = action.payload;
    },
    productsRemoveRequest(state) {
      state.productsDetail.loading = true;
      state.productsDetail.error = null;
    },
    productsRemoveSuccess(state) {
      state.productsDetail.loading = false;
    },
    productsRemoveFailure(state, action) {
      state.productsDetail.loading = false;
      state.productsDetail.error = action.payload;
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
