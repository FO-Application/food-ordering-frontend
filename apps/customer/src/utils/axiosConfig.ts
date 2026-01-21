import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
    // CRITICAL: Enable credentials to allow browser to receive and store HttpOnly cookies
    withCredentials: true,
});

// Request interceptor for logging or adding additional headers
api.interceptors.request.use(
    (config) => {
        // Log requests in development mode (Vite uses import.meta.env)
        if (import.meta.env.DEV) {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle common error scenarios
        if (error.response) {
            const { status, data } = error.response;

            // Auto Refresh Token Logic
            if (status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    console.log('[API] Access Token expired. Refreshing...');
                    // Call refresh token API
                    await api.post('/auth/refresh');
                    console.log('[API] Token refresh successful. Retrying original request...');

                    // Retry original request
                    return api(originalRequest);
                } catch (refreshError) {
                    console.error('[API] Refresh token failed:', refreshError);
                    // Optionally clear user state/redirect to login
                    // window.location.href = '/';
                    return Promise.reject(refreshError);
                }
            }

            switch (status) {
                case 401:
                    console.error('[API Error] Unauthorized - Please login again');
                    break;
                case 403:
                    console.error('[API Error] Forbidden - Access denied');
                    break;
                case 500:
                    console.error('[API Error] Server error:', data?.message || 'Internal server error');
                    break;
                default:
                    console.error(`[API Error] ${status}:`, data?.message || error.message);
            }
        } else if (error.request) {
            // Network error - no response received
            console.error('[API Error] Network error - Please check your connection');
        }

        return Promise.reject(error);
    }
);

export default api;
