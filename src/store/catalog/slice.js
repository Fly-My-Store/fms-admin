import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], meta: { page: 1, pageSize: 10, total: 0, totalPages: 1 }, loading: false, error: null });
const initialEntity = () => ({ data: null, loading: false, error: null });

const initialState = {
  brands: initialList(),
  categories: initialList(),
  products: initialList(),
  variants: initialList(),
  brandsDetail: initialEntity(),
  categoryDetail: initialEntity(),
  productDetail: initialEntity(),
  variantDetail: initialEntity()
};

const slice = createSlice({
  name: 'catalog',
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
      state.categoryDetail.loading = true;
      state.categoryDetail.error = null;
    },
    categoriesGetSuccess(state, action) {
      state.categoryDetail.loading = false;
      state.categoryDetail.data = action.payload?.data || action.payload;
    },
    categoriesGetFailure(state, action) {
      state.categoryDetail.loading = false;
      state.categoryDetail.error = action.payload;
    },
    categoriesCreateRequest(state) {
      state.categoryDetail.loading = true;
      state.categoryDetail.error = null;
    },
    categoriesCreateSuccess(state, action) {
      state.categoryDetail.loading = false;
      state.categoryDetail.data = action.payload?.data || action.payload;
    },
    categoriesCreateFailure(state, action) {
      state.categoryDetail.loading = false;
      state.categoryDetail.error = action.payload;
    },
    categoriesUpdateRequest(state) {
      state.categoryDetail.loading = true;
      state.categoryDetail.error = null;
    },
    categoriesUpdateSuccess(state, action) {
      state.categoryDetail.loading = false;
      state.categoryDetail.data = action.payload?.data || action.payload;
    },
    categoriesUpdateFailure(state, action) {
      state.categoryDetail.loading = false;
      state.categoryDetail.error = action.payload;
    },
    categoriesRemoveRequest(state) {
      state.categoryDetail.loading = true;
      state.categoryDetail.error = null;
    },
    categoriesRemoveSuccess(state) {
      state.categoryDetail.loading = false;
    },
    categoriesRemoveFailure(state, action) {
      state.categoryDetail.loading = false;
      state.categoryDetail.error = action.payload;
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
      state.productDetail.loading = true;
      state.productDetail.error = null;
    },
    productsGetSuccess(state, action) {
      state.productDetail.loading = false;
      state.productDetail.data = action.payload?.data || action.payload;
    },
    productsGetFailure(state, action) {
      state.productDetail.loading = false;
      state.productDetail.error = action.payload;
    },
    productsCreateRequest(state) {
      state.productDetail.loading = true;
      state.productDetail.error = null;
    },
    productsCreateSuccess(state, action) {
      state.productDetail.loading = false;
      state.productDetail.data = action.payload?.data || action.payload;
    },
    productsCreateFailure(state, action) {
      state.productDetail.loading = false;
      state.productDetail.error = action.payload;
    },
    productsUpdateRequest(state) {
      state.productDetail.loading = true;
      state.productDetail.error = null;
    },
    productsUpdateSuccess(state, action) {
      state.productDetail.loading = false;
      state.productDetail.data = action.payload?.data || action.payload;
    },
    productsUpdateFailure(state, action) {
      state.productDetail.loading = false;
      state.productDetail.error = action.payload;
    },
    productsRemoveRequest(state) {
      state.productDetail.loading = true;
      state.productDetail.error = null;
    },
    productsRemoveSuccess(state) {
      state.productDetail.loading = false;
    },
    productsRemoveFailure(state, action) {
      state.productDetail.loading = false;
      state.productDetail.error = action.payload;
    },

    // ===== Variants =====
    variantsListRequest(state) {
      state.variants.loading = true;
      state.variants.error = null;
    },
    variantsListSuccess(state, action) {
      state.variants.loading = false;
      state.variants.rows = action.payload?.data || [];
      state.variants.meta = action.payload?.meta || state.variants.meta;
    },
    variantsListFailure(state, action) {
      state.variants.loading = false;
      state.variants.error = action.payload;
    },

    variantsGetRequest(state) {
      state.variantDetail = initialEntity();
      state.variantDetail.loading = true;
    },
    variantsGetSuccess(state, action) {
      state.variantDetail.loading = false;
      state.variantDetail.data = action.payload?.data || action.payload;
    },
    variantsGetFailure(state, action) {
      state.variantDetail.loading = false;
      state.variantDetail.error = action.payload;
    },

    variantsCreateRequest(state) {
      state.variantDetail.loading = true;
      state.variantDetail.error = null;
    },
    variantsCreateSuccess(state, action) {
      state.variantDetail.loading = false;
      state.variantDetail.data = action.payload?.data || action.payload;
    },
    variantsCreateFailure(state, action) {
      state.variantDetail.loading = false;
      state.variantDetail.error = action.payload;
    },

    variantsUpdateRequest(state) {
      state.variantDetail.loading = true;
      state.variantDetail.error = null;
    },
    variantsUpdateSuccess(state, action) {
      state.variantDetail.loading = false;
      state.variantDetail.data = action.payload?.data || action.payload;
    },
    variantsUpdateFailure(state, action) {
      state.variantDetail.loading = false;
      state.variantDetail.error = action.payload;
    },

    variantsRemoveRequest(state) {
      state.variantDetail.loading = true;
      state.variantDetail.error = null;
    },
    variantsRemoveSuccess(state) {
      state.variantDetail.loading = false;
    },
    variantsRemoveFailure(state, action) {
      state.variantDetail.loading = false;
      state.variantDetail.error = action.payload;
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
