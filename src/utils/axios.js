// services/axios.ts (or your current path)
import axios from 'axios';
import { ROUTES, STORAGE_KEYS } from './constants';

// ⬇️ bring the store + logout action
import { store } from '../store'; // <-- adjust import to your store file
import { logout } from '../store/auth/authSlice'; // <-- adjust path if different
console.log('Server-side API URL:', process.env.NEXT_PUBLIC_API_URL);
const axiosServices = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/'
});

// Client-side debug
if (typeof window !== 'undefined') {
  console.log('Client-side axios baseURL:', axiosServices.defaults.baseURL);
  console.log('Client-side env var:', process.env.NEXT_PUBLIC_API_URL);
}

// ---- REQUEST: attach token if present
axiosServices.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Guard to avoid multiple concurrent logouts from parallel 401s
let isLoggingOut = false;

// Centralized logout side-effect
const hardLogout = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  try {
    // 1) Reset entire Redux store (rootReducer resets all slices to initialState)
    store.dispatch(logout());

    // 2) Best-effort header cleanup on this runtime instance
    delete axiosServices.defaults.headers.common['Authorization'];

    // 3) Redirect away from protected routes
    if (typeof window !== 'undefined' && !window.location.pathname.includes(ROUTES.LOGIN)) {
      window.location.replace(ROUTES.LOGIN);
    }
  } finally {
    // small delay to prevent rapid re-entry; optional but helpful with bursty 401s
    setTimeout(() => {
      isLoggingOut = false;
    }, 300);
  }
};

// ---- RESPONSE: handle 401 -> nuke state + storage + redirect
axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      hardLogout();
    }

    // keep your previous rejection shape
    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;
