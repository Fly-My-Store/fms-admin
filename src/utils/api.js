import axiosServices from 'utils/axios';

export async function get(path, params) {
  const r = await axiosServices.get(path, { params });
  return r.data;
}
export async function post(path, data) {
  const r = await axiosServices.post(path, data);
  return r.data;
}
export async function patch(path, data) {
  const r = await axiosServices.patch(path, data);
  return r.data;
}
export async function del(path) {
  const r = await axiosServices.delete(path);
  return r.data;
}
