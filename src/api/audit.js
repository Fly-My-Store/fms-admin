import { get } from '../utils/api';

export const listAudits = (params) => get('admin/audit/logs', params);
export const getAudit = (id) => get(`admin/audit/logs/${id}`);
