import axiosConfig from '../utils/axiosConfig';
import type { APIResponse } from './authService';

export interface ProductResponse {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    isAvailable: boolean;
    categoryId: number;
}

const productService = {
    getProductsByCategory: async (categoryId: number): Promise<APIResponse<ProductResponse[]>> => {
        const response = await axiosConfig.get<APIResponse<ProductResponse[]>>(`/product/category/${categoryId}`);
        return response.data;
    },

    getProductById: async (productId: number): Promise<APIResponse<ProductResponse>> => {
        const response = await axiosConfig.get<APIResponse<ProductResponse>>(`/product/${productId}`);
        return response.data;
    }
};

export default productService;
