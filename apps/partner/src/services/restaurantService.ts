
import api from '../utils/axiosConfig';

export interface RestaurantResponse {
    id: number;
    name: string;
    slug: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
    isActive: boolean;
    ratingAverage: number;
    reviewCount: number;
    imageFileUrl: string;
    description: string;
}

export interface RestaurantRequest {
    name: string;
    ownerId: number;
    description: string;
    slug: string;
    address: string;
    latitude: number;
    longitude: number;
    phone: string;
    cuisinesId: number[];
}

const restaurantService = {
    getAllRestaurants: async (page = 0, size = 100): Promise<any> => {
        // TODO: Backend currently lacks get-by-owner-id. This fetches ALL.
        const response = await api.get(`/restaurant?page=${page}&size=${size}`);
        return response.data;
    },

    createRestaurant: async (data: RestaurantRequest, imageFile: File): Promise<any> => {
        const formData = new FormData();

        // Append JSON data as a Blob with application/json type
        // Important: Spring Boot @RequestPart("data") expects JSON
        const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        formData.append('data', jsonBlob);

        // Append image
        formData.append('image', imageFile);

        return api.post('/restaurant', formData, {
            headers: {
                'Content-Type': undefined // Unset default JSON content type to let browser set multipart/form-data with boundary
            },
            withCredentials: true,
        }).then(res => res.data);
    },

    getCuisines: async (): Promise<any> => {
        const response = await api.get('/cuisine');
        return response.data;
    }
};

export default restaurantService;
