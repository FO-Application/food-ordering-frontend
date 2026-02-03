import api from '../utils/axiosConfig';

// Types
export interface OrderItemRequest {
    productId: number;
    quantity: number;
    optionIds?: number[];
}

export interface OrderRequest {
    merchantId: number;
    paymentMethod: 'COD' | 'BANKING' | 'ZALOPAY' | 'PAYPAL';
    deliveryAddress: string;
    deliveryLatitude: number;
    deliveryLongitude: number;
    items: OrderItemRequest[];
}

export interface OrderItemResponse {
    productId: number;
    productName: string;
    productImage: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

export interface OrderResponse {
    id: number;
    userId: number;
    merchantId: number;
    merchantName: string;
    merchantLogo: string;
    merchantLatitude: number;
    merchantLongitude: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryAddress: string;
    deliveryLatitude: number;
    deliveryLongitude: number;
    distanceKm: number;
    subTotal: number;
    shippingFee: number;
    discountAmount: number;
    grandTotal: number;
    descriptionOrder: string;
    orderStatus: string;
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
    orderItems: OrderItemResponse[];
    review: any;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

// API Functions
export const createOrder = async (request: OrderRequest): Promise<OrderResponse> => {
    const response = await api.post('/order', request);
    return response.data.result;
};

export const getMyOrders = async (page: number = 0, size: number = 10): Promise<PageResponse<OrderResponse>> => {
    const response = await api.get('/order', { params: { page, size } });
    return response.data.result;
};

export const getOrderById = async (orderId: number): Promise<OrderResponse> => {
    const response = await api.get(`/order/${orderId}`);
    return response.data.result;
};

export const cancelOrder = async (orderId: number): Promise<OrderResponse> => {
    const response = await api.patch(`/order/${orderId}/cancel`);
    return response.data.result;
};

export default {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder
};
