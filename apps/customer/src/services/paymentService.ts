import api from '../utils/axiosConfig';

// Types
export interface ZaloPayCreateResponse {
    order_url: string;
    app_trans_id: string;
    return_code: number;
    return_message: string;
    zp_trans_token?: string;
}

export interface ZaloPayQueryResponse {
    amount: number;
    zp_trans_id: number;
    return_message: string;
    is_processing: boolean;
    return_code: number; // 1 = success, 2 = fail, 3 = processing
    order_status_update?: string;
}

// Create ZaloPay payment
export const createZaloPayPayment = async (orderId: number, amount: number): Promise<ZaloPayCreateResponse> => {
    const response = await api.post('/payment/zalopay/create', null, {
        params: { orderId, amount }
    });
    return response.data.result;
};

// Query ZaloPay payment status
export const queryZaloPayStatus = async (appTransId: string): Promise<ZaloPayQueryResponse> => {
    const response = await api.post('/payment/zalopay/query', null, {
        params: { appTransId }
    });
    return response.data.result;
};

export default {
    createZaloPayPayment,
    queryZaloPayStatus
};
