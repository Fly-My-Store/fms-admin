import { get, post, patch } from '../utils/api';

// Unified fare rules (immutable: create + deactivate only)
export const listFareRules = (params) => get('admin/fare', params);
export const getFareRule = (id) => get(`admin/fare/${id}`);
export const createFareRule = (data) => post('admin/fare', data);
export const deactivateFareRule = (id) => patch(`admin/fare/${id}/deactivate`);

// Payouts
export const listPayouts = (params) => get('admin/payouts', params);
export const createPayout = (data) => post('admin/payouts', data);
export const getPayoutSummary = (params) => get('admin/payouts/summary', params);
