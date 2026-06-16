import { get, patch } from '../utils/api';

export const listSupportTickets = (params) => get('admin/support/tickets', params);
export const getSupportTicket = (id) => get(`admin/support/tickets/${id}`);
export const updateSupportTicket = (id, data) => patch(`admin/support/tickets/${id}`, data);
