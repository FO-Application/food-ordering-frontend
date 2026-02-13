import api from '../utils/axiosConfig';

export interface ReviewRequest {
    orderId: number;
    rating: number;
    comment?: string;
}

export interface ReviewResponse {
    id: number;
    userId: number;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export const createReview = async (request: ReviewRequest): Promise<ReviewResponse> => {
    const response = await api.post('/review', request);
    return response.data.result;
};

export const getReviewByOrder = async (orderId: number): Promise<ReviewResponse> => {
    const response = await api.get(`/review/order/${orderId}`);
    return response.data.result;
};

export const getReviewsByMerchant = async (merchantId: number, page = 0, size = 10): Promise<any> => {
    const response = await api.get(`/review/merchant/${merchantId}?page=${page}&size=${size}`);
    return response.data;
};

export default {
    createReview,
    getReviewByOrder,
    getReviewsByMerchant,
};
