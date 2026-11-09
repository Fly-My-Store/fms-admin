import { get, post } from '../utils/api';

export const listAudits = (params) => get('admin/audits/audits', params);
export const getAudit = (id) => get(`admin/audits/audits/${id}`);
export const getMapsUsage = (params) => get('admin/audits/maps-usage', params);
export const recordMapsTelemetry = (payload) => post('admin/audits/maps-telemetry', payload);
