import superadmin from './platform';
import business from './business';
import { STORAGE_KEYS } from 'utils/constants';

let user = null;

if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }
}

const menuItems = {
  items: [user?.type === 'platform' ? superadmin : business]
};

export default menuItems;