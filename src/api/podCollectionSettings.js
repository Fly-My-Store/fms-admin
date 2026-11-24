import { get, patch } from '../utils/api';

export const getPodCollectionSettings = () => get('admin/pod-collection-settings');
export const updatePodCollectionSettings = (data) => patch('admin/pod-collection-settings', data);
