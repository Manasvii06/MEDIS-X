export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api';
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');
