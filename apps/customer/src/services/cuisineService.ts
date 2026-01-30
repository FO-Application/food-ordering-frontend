import api from '../utils/axiosConfig';

export interface CuisineResponse {
    id: number;
    name: string;
    slug: string;
    imageFileUrl: string;
}

export interface APIResponse<T> {
    code: number;
    message: string;
    result: T;
}

const cuisineService = {
    getAllCuisines: async (): Promise<APIResponse<CuisineResponse[]>> => {
        const response = await api.get('/cuisine');
        return response.data;
    },

    getCuisineById: async (id: number): Promise<APIResponse<CuisineResponse>> => {
        const response = await api.get(`/cuisine/${id}`);
        return response.data;
    }
};

export default cuisineService;
