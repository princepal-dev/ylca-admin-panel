import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Token present:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set');
    } else {
      console.log('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('API Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} for ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`API Error: ${error.response?.status} for ${error.config?.url}`, error.response?.data);
    if (error.response?.status === 401) {
      // Prevent multiple redirects by checking if we're already redirecting
      if (!sessionStorage.getItem('redirecting')) {
        sessionStorage.setItem('redirecting', 'true');
        // Clear initialization flag and token
        sessionStorage.removeItem('authInitialized');
        localStorage.removeItem('token');

        // Dispatch logout action to clear user data from Redux
        // We need to import the store here to dispatch the action
        import('../store').then(({ store }) => {
          import('../store/slices/authSlice').then(({ logout }) => {
            store.dispatch(logout());
          });
        });

        // Use window.location.href for a clean redirect to avoid React Router issues
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
