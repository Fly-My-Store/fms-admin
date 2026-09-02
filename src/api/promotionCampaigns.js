import { get, post, patch, del } from '../utils/api';

export const listPromotionCampaigns = (params) => get('admin/promotion-campaigns', params);
export const getPromotionCampaign = (id) => get(`admin/promotion-campaigns/${id}`);
export const createPromotionCampaign = (data) => post('admin/promotion-campaigns', data);
export const updatePromotionCampaign = (id, data) => patch(`admin/promotion-campaigns/${id}`, data);
export const deletePromotionCampaign = (id) => del(`admin/promotion-campaigns/${id}`);
export const attachCampaignPromotions = (id, data) => post(`admin/promotion-campaigns/${id}/promotions`, data);
export const detachCampaignPromotion = (campaignId, promotionId) =>
  del(`admin/promotion-campaigns/${campaignId}/promotions/${promotionId}`);
export const listCampaignRedemptions = (id, params) => get(`admin/promotion-campaigns/${id}/redemptions`, params);
