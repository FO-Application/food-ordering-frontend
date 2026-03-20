import api from '../utils/axiosConfig';

export interface ScheduleResponse {
    id: number;
    dayOfWeek: number;
    openTime: string;   // "HH:mm:ss"
    closeTime: string;  // "HH:mm:ss"
    restaurantName: string;
}

export interface ScheduleRequest {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    restaurantId: number;
}

export interface SchedulePatchRequest {
    dayOfWeek?: number;
    openTime?: string;
    closeTime?: string;
    restaurantId?: number;
}

const scheduleService = {
    getByRestaurant: async (slug: string): Promise<any> => {
        const response = await api.get(`/restaurant-schedule/restaurant/${slug}`);
        return response.data;
    },

    create: async (data: ScheduleRequest): Promise<any> => {
        const response = await api.post('/restaurant-schedule', data);
        return response.data;
    },

    update: async (id: number, data: SchedulePatchRequest): Promise<any> => {
        const response = await api.put(`/restaurant-schedule/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<any> => {
        const response = await api.delete(`/restaurant-schedule/${id}`);
        return response.data;
    },
};

export default scheduleService;
