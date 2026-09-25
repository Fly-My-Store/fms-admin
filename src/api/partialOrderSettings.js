import { get, patch } from '../utils/api';

export const getPartialOrderSettings = () => get('admin/partial-order-settings');
export const updatePartialOrderSettings = (data) => patch('admin/partial-order-settings', data);
