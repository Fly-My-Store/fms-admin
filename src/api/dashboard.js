import { get } from '../utils/api';

export const getDashboardStats = () => get('admin/dashboard/stats');
