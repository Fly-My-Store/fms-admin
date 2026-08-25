import { get, post, patch } from '../utils/api';

export const listInvoiceSettings = () => get('admin/invoice-settings');
export const getActiveInvoiceSetting = () => get('admin/invoice-settings/active');
export const getInvoiceSetting = (id) => get(`admin/invoice-settings/${id}`);
export const createInvoiceSettingVersion = (data) => post('admin/invoice-settings', data);
export const getInvoiceSequences = () => get('admin/invoice-settings/sequences');
export const updateInvoiceSequences = (data) => patch('admin/invoice-settings/sequences', data);
