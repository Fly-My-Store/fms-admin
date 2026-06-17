import { get } from 'utils/api';

export async function getUserById(id, params) {
  return get(`admin/iam/users/${id}`, params);
}
