import { get } from '../utils/api';

export const listAudits = (params) => get('admin/audits/audits', params);
export const getAudit = (id) => get(`admin/audits/audits/${id}`);
