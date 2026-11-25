import { get } from '../utils/api';

export const listQuoteRequests = (params) =>
  get('admin/orders-payments/quote-requests', params);

export const getQuoteRequest = (id) =>
  get(`admin/orders-payments/quote-requests/${id}`);
