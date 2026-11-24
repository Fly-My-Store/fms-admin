import { del, get, patch, post } from '../utils/api';

export const listOffers = (params) => get('admin/offers', params);
export const getOffer = (id) => get(`admin/offers/${id}`);
export const createOffer = (body) => post('admin/offers', body);
export const updateOffer = (id, body) => patch(`admin/offers/${id}`, body);
export const removeOffer = (id) => del(`admin/offers/${id}`);
