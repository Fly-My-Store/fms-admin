import { get, post, patch } from '../utils/api';

export const listOrders = (params) => get('admin/orders-payments/orders', params);
export const getOrder = (id) => get(`admin/orders-payments/orders/${id}`);
export const updateOrder = (id, data) => patch(`admin/orders-payments/orders/${id}`, data);
export const cancelOrder = (id) => post(`admin/orders-payments/orders/${id}/cancel`);
export const listOrderItems = (id) => get(`admin/orders-payments/orders/${id}/items`);
export const listOrderEvents = (id) => get(`admin/orders-payments/orders/${id}/events`);
export const createOrderEvent = (id, data) => post(`admin/orders-payments/orders/${id}/events`, data);
export const initiateRefundForOrder = (id, data) => post(`admin/orders-payments/orders/${id}/refunds`, data);
export const retryPaymentForOrder = (id) => post(`admin/orders-payments/orders/${id}/payments/retry`);

export const listPayments = (params) => get('admin/orders-payments/payments', params);
export const getPayment = (id) => get(`admin/orders-payments/payments/${id}`);
export const updatePayment = (id, data) => patch(`admin/orders-payments/payments/${id}`, data);

export const listRefunds = (params) => get('admin/orders-payments/refunds', params);
export const getRefund = (id) => get(`admin/orders-payments/refunds/${id}`);
export const createRefund = (data) => post('admin/orders-payments/refunds', data);
export const updateRefund = (id, data) => patch(`admin/orders-payments/refunds/${id}`, data);
