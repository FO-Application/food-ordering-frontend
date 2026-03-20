import api from '../utils/axiosConfig';

export interface ScheduleResponse {
    id: number;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    restaurantName: string;
}

const scheduleService = {
    getByRestaurant: async (slug: string): Promise<any> => {
        const response = await api.get(`/restaurant-schedule/restaurant/${slug}`);
        return response.data;
    },
};

export default scheduleService;
