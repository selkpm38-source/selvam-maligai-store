import axios from 'axios';

/**
 * Talks to the real Phase 1 backend (auth endpoints are live; product/cart/
 * order endpoints land in Phase 2 and will slot into this same client).
 */
const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // send the httpOnly refresh cookie
});

let accessToken = null;
export function setAccessToken(token) {
  accessToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await apiClient.post('/auth/refresh');
        setAccessToken(data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(original);
      } catch {
        setAccessToken(null);
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (payload) => apiClient.post('/auth/register', payload),
  login: (payload) => apiClient.post('/auth/login', payload),
  refresh: () => apiClient.post('/auth/refresh'),
  logout: () => apiClient.post('/auth/logout'),
};

export default apiClient;
