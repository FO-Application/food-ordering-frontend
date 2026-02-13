import api from '../utils/axiosConfig';

export interface RestaurantResponse {
    id: number;
    name: string;
    address: string;
    phone: string;
    ratingAverage: number;
    reviewCount: number;
    imageFileUrl: string; // Correct field name
    distance?: number;
    deliveryTime?: string;
    isActive: boolean;
    ownerId: number;
    slug: string; // Added slug field
    cuisineVariables?: Record<string, any>;
    latitude?: number;
    longitude?: number;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface APIResponse<T> {
    code: number;
    message: string;
    result: T;
}

const restaurantService = {
    getAllRestaurants: async (page = 0, size = 100): Promise<APIResponse<PageResponse<RestaurantResponse>>> => {
        const response = await api.get('/restaurant', {
            params: { page, size }
        });
        return response.data;
    },

    getRestaurantsByCuisine: async (slug: string, page = 0, size = 10): Promise<APIResponse<PageResponse<RestaurantResponse>>> => {
        const response = await api.get(`/restaurant/cuisine/${slug}`, {
            params: { page, size }
        });
        return response.data;
    },

    getNearbyRestaurants: async (
        lat: number,
        lon: number,
        radius = 5.0,
        cuisine?: string,
        page = 0,
        size = 10
    ): Promise<APIResponse<PageResponse<RestaurantResponse>>> => {
        const response = await api.get('/restaurant/nearby', {
            params: {
                lat,
                lon,
                radius,
                cuisine,
                page,
                size
            }
        });
        return response.data;
    },

    getRestaurantById: async (id: number): Promise<APIResponse<RestaurantResponse>> => {
        const response = await api.get(`/restaurant/${id}`);
        return response.data;
    }
};

export default restaurantService;
