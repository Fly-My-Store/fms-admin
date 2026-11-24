import { get } from '../utils/api';

export const listPrescriptionRequests = (params) =>
  get('admin/orders-payments/prescription-requests', params);

export const getPrescriptionRequest = (id) =>
  get(`admin/orders-payments/prescription-requests/${id}`);
