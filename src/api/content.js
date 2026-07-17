import { get, post, patch, del } from '../utils/api';

export const listReviews = (params) => get('admin/content/reviews', params);
export const getReview = (id) => get(`admin/content/reviews/${id}`);
export const updateReview = (id, data) => patch(`admin/content/reviews/${id}`, data);
export const listReviewEvents = (reviewId, params) => get(`admin/content/reviews/${reviewId}/events`, params);
export const createReviewEvent = (reviewId, data) => post(`admin/content/reviews/${reviewId}/events`, data);

export const listBanners = (params) => get('admin/content/banners', params);
export const getBanner = (id) => get(`admin/content/banners/${id}`);
export const createBanner = (data) => post('admin/content/banners', data);
export const updateBanner = (id, data) => patch(`admin/content/banners/${id}`, data);
export const deleteBanner = (id) => del(`admin/content/banners/${id}`);

export const listFaqs = (params) => get('admin/content/faqs', params);
export const getFaq = (id) => get(`admin/content/faqs/${id}`);
export const createFaq = (data) => post('admin/content/faqs', data);
export const updateFaq = (id, data) => patch(`admin/content/faqs/${id}`, data);
export const deleteFaq = (id) => del(`admin/content/faqs/${id}`);
