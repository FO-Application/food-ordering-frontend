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

// Fallback base URL when ngrok/proxy returns 500
const FALLBACK_BASE_URL = 'http://localhost:8080/api/v1';

// Response interceptor with loop-proof refresh logic + 500 fallback
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // --- Fallback to localhost:8080 on 500 errors ---
        if (error.response?.status >= 500 && !originalRequest._fallbackRetry) {
            originalRequest._fallbackRetry = true;
            console.warn(`[API Fallback] Server error ${error.response.status}, retrying on ${FALLBACK_BASE_URL}...`);

            // Build the full fallback URL
            const fallbackUrl = originalRequest.url?.startsWith('http')
                ? originalRequest.url
                : `${FALLBACK_BASE_URL}${originalRequest.url}`;

            try {
                const fallbackResponse = await axios({
                    ...originalRequest,
                    baseURL: undefined,
                    url: fallbackUrl,
                    headers: {
                        ...originalRequest.headers,
                        'ngrok-skip-browser-warning': 'true',
                    },
                });
                return fallbackResponse;
            } catch (fallbackError) {
                console.error('[API Fallback] Fallback also failed:', fallbackError);
                return Promise.reject(fallbackError);
            }
        }

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
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

