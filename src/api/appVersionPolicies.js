import { get, put } from 'utils/api';

export const listVersionPolicies = () => get('admin/app-version-policies');

export const upsertVersionPolicy = (payload) => put('admin/app-version-policies', payload);

/** Shown in apps when admin leaves title/message blank. */
export const DEFAULT_UPDATE_TITLE = 'App Update Required!';
export const DEFAULT_UPDATE_MESSAGE =
  'We have added new features and fix some bugs to make your experience seamless.';

export const EMPTY_POLICY = {
  recommended_version: '',
  min_supported_version: '',
  title: DEFAULT_UPDATE_TITLE,
  message: DEFAULT_UPDATE_MESSAGE,
  store_url: '',
};

export function policyKey(appType, platform) {
  return `${appType}:${platform}`;
}

export function indexPolicies(rows = []) {
  const map = {};
  for (const row of rows) {
    if (!row?.app_type || !row?.platform) continue;
    map[policyKey(row.app_type, row.platform)] = row;
  }
  return map;
}

export function formFromPolicy(row) {
  if (!row) return {...EMPTY_POLICY};
  return {
    recommended_version: String(row.recommended_version || row.latest_version || ''),
    min_supported_version: String(row.min_supported_version || ''),
    title: String(row.title || DEFAULT_UPDATE_TITLE),
    message: String(row.message || DEFAULT_UPDATE_MESSAGE),
    store_url: String(row.store_url || ''),
  };
}
