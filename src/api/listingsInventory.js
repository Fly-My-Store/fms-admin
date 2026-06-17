import { get } from '../utils/api';

export const listStoreVariants = (storeId, params) =>
  get(`admin/listings-inventory/stores/${storeId}/variants`, params);
