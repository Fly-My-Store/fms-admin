import { get, post } from '../utils/api';

export const listWebhookEvents = (params) => get('admin/integrations/webhooks/events', params);
export const getWebhookEvent = (id) => get(`admin/integrations/webhooks/events/${id}`);
export const replayWebhookEvent = (id) => post(`admin/integrations/webhooks/events/${id}/replay`);
