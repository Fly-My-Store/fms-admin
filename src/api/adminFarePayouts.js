import { get, put, post } from '../utils/api';

// Fare (pricing)
export const getActiveFare = () => get('admin/fare');
export const updateActiveFare = (data) => put('admin/fare', data);

// Payouts
export const listPayouts = (params) => get('admin/payouts', params);
export const createPayout = (data) => post('admin/payouts', data);
export const getPayoutSummary = () => get('admin/payouts/summary');
