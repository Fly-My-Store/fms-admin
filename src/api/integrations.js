import { get, post } from '../utils/api';

export const listWebhookEvents = (params) => get('admin/integrations/webhook-events', params);
export const getWebhookEvent = (id) => get(`admin/integrations/webhook-events/${id}`);
export const replayWebhookEvent = (id) => post(`admin/integrations/webhook-events/${id}/replay`);
