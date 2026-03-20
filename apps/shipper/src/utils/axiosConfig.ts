import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
    withCredentials: true,
});

// --- Token Refresh State ---
let isRefreshing = false;
let refreshSubscribers: ((success: boolean) => void)[] = [];

function onRefreshComplete(success: boolean) {
    refreshSubscribers.forEach((cb) => cb(success));
    refreshSubscribers = [];
}

// Request interceptor for logging
api.interceptors.request.use(
    (config) => {
        if (import.meta.env.DEV) {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor with loop-proof refresh logic
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't try to refresh if this IS the refresh request
            if (originalRequest.url === '/auth/refresh') {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            // If already refreshing, wait for the ongoing refresh to finish
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshSubscribers.push((success: boolean) => {
                        if (success) {
                            resolve(api(originalRequest));
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            isRefreshing = true;

            try {
                // Use plain axios (no interceptors) to avoid loop
                await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
                isRefreshing = false;
                onRefreshComplete(true);
                return api(originalRequest);
            } catch {
                isRefreshing = false;
                onRefreshComplete(false);
                // Clear auth state and redirect to login
                localStorage.removeItem('shipper_authenticated');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
