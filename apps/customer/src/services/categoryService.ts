import axiosConfig from '../utils/axiosConfig';
import type { APIResponse } from './authService';

export interface CategoryResponse {
    id: number;
    name: string;
    description?: string;
    displayOrder?: number;
}

const categoryService = {
    getAllCategories: async (restaurantSlug: string): Promise<APIResponse<CategoryResponse[]>> => {
        const response = await axiosConfig.get<APIResponse<CategoryResponse[]>>(`/category/restaurant/${restaurantSlug}`);
        return response.data;
    },

    getCategoryById: async (categoryId: number): Promise<APIResponse<CategoryResponse>> => {
        const response = await axiosConfig.get<APIResponse<CategoryResponse>>(`/category/${categoryId}`);
        return response.data;
    }
};

export default categoryService;
