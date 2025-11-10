import { createSlice } from '@reduxjs/toolkit';

const initialList = () => ({ rows: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 }, loading: false, error: null });
const initialEntity = () => ({ data: null, loading: false, error: null });

const initialState = {
  reviews: initialList(),
  banners: initialList(),
  reviewsDetail: initialEntity(),
  bannersDetail: initialEntity()
};

const slice = createSlice({
  name: 'admin/content',
  initialState,
  reducers: {
    reviewsListRequest(state) {
      state.reviews.loading = true;
      state.reviews.error = null;
    },
    reviewsListSuccess(state, action) {
      state.reviews.loading = false;
      state.reviews.rows = action.payload?.data || [];
      state.reviews.meta = action.payload?.meta || state.reviews.meta;
    },
    reviewsListFailure(state, action) {
      state.reviews.loading = false;
      state.reviews.error = action.payload;
    },
    reviewsGetRequest(state) {
      state.reviewsDetail.loading = true;
      state.reviewsDetail.error = null;
    },
    reviewsGetSuccess(state, action) {
      state.reviewsDetail.loading = false;
      state.reviewsDetail.data = action.payload?.data || action.payload;
    },
    reviewsGetFailure(state, action) {
      state.reviewsDetail.loading = false;
      state.reviewsDetail.error = action.payload;
    },
    reviewsCreateRequest(state) {
      state.reviewsDetail.loading = true;
      state.reviewsDetail.error = null;
    },
    reviewsCreateSuccess(state, action) {
      state.reviewsDetail.loading = false;
      state.reviewsDetail.data = action.payload?.data || action.payload;
    },
    reviewsCreateFailure(state, action) {
      state.reviewsDetail.loading = false;
      state.reviewsDetail.error = action.payload;
    },
    reviewsUpdateRequest(state) {
      state.reviewsDetail.loading = true;
      state.reviewsDetail.error = null;
    },
    reviewsUpdateSuccess(state, action) {
      state.reviewsDetail.loading = false;
      state.reviewsDetail.data = action.payload?.data || action.payload;
    },
    reviewsUpdateFailure(state, action) {
      state.reviewsDetail.loading = false;
      state.reviewsDetail.error = action.payload;
    },
    reviewsRemoveRequest(state) {
      state.reviewsDetail.loading = true;
      state.reviewsDetail.error = null;
    },
    reviewsRemoveSuccess(state) {
      state.reviewsDetail.loading = false;
    },
    reviewsRemoveFailure(state, action) {
      state.reviewsDetail.loading = false;
      state.reviewsDetail.error = action.payload;
    },

    bannersListRequest(state) {
      state.banners.loading = true;
      state.banners.error = null;
    },
    bannersListSuccess(state, action) {
      state.banners.loading = false;
      state.banners.rows = action.payload?.data || [];
      state.banners.meta = action.payload?.meta || state.banners.meta;
    },
    bannersListFailure(state, action) {
      state.banners.loading = false;
      state.banners.error = action.payload;
    },
    bannersGetRequest(state) {
      state.bannersDetail.loading = true;
      state.bannersDetail.error = null;
    },
    bannersGetSuccess(state, action) {
      state.bannersDetail.loading = false;
      state.bannersDetail.data = action.payload?.data || action.payload;
    },
    bannersGetFailure(state, action) {
      state.bannersDetail.loading = false;
      state.bannersDetail.error = action.payload;
    },
    bannersCreateRequest(state) {
      state.bannersDetail.loading = true;
      state.bannersDetail.error = null;
    },
    bannersCreateSuccess(state, action) {
      state.bannersDetail.loading = false;
      state.bannersDetail.data = action.payload?.data || action.payload;
    },
    bannersCreateFailure(state, action) {
      state.bannersDetail.loading = false;
      state.bannersDetail.error = action.payload;
    },
    bannersUpdateRequest(state) {
      state.bannersDetail.loading = true;
      state.bannersDetail.error = null;
    },
    bannersUpdateSuccess(state, action) {
      state.bannersDetail.loading = false;
      state.bannersDetail.data = action.payload?.data || action.payload;
    },
    bannersUpdateFailure(state, action) {
      state.bannersDetail.loading = false;
      state.bannersDetail.error = action.payload;
    },
    bannersRemoveRequest(state) {
      state.bannersDetail.loading = true;
      state.bannersDetail.error = null;
    },
    bannersRemoveSuccess(state) {
      state.bannersDetail.loading = false;
    },
    bannersRemoveFailure(state, action) {
      state.bannersDetail.loading = false;
      state.bannersDetail.error = action.payload;
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
