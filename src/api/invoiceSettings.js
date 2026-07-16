import { get, post } from '../utils/api';

export const listInvoiceSettings = () => get('admin/invoice-settings');
export const getActiveInvoiceSetting = () => get('admin/invoice-settings/active');
export const getInvoiceSetting = (id) => get(`admin/invoice-settings/${id}`);
export const createInvoiceSettingVersion = (data) => post('admin/invoice-settings', data);
