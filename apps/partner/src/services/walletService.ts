import api from '../utils/axiosConfig';

export interface WalletResponse {
    balance: number;
    currency: string;
}

export interface WalletTransactionResponse {
    id: number;
    amount: number;
    transactionType: 'ORDER_INCOME' | 'WITHDRAW' | 'REFUND';
    description: string;
    createdAt: string;
    orderId: number;
}

export interface APIResponse<T> {
    code: number;
    message: string;
    result: T;
}


export interface DailyStatResponse {
    date: string;
    income: number;
    expense: number;
}

const walletService = {
    getMyWallet: async (): Promise<APIResponse<WalletResponse>> => {
        const response = await api.get('/wallet');
        return response.data;
    },

    getMyTransactions: async (
        page = 0,
        size = 10,
        startDate?: string,
        endDate?: string,
        type?: string
    ): Promise<APIResponse<any>> => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('size', String(size));
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (type) params.append('type', type);

        const response = await api.get(`/wallet/transactions?${params.toString()}`);
        return response.data;
    },

    exportTransactions: async (startDate?: string, endDate?: string, type?: string) => {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            if (type) params.append('type', type);

            const response = await api.get('/wallet/export', { // Changed from merchantClient to api
                params,
                responseType: 'blob'
            });

            // Trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'sao-ke-vi-fast.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error(error);
            throw error;
        }
    },

    withdraw: async (amount: number): Promise<APIResponse<WalletResponse>> => {
        const response = await api.post(`/wallet/withdraw?amount=${amount}`); // Changed from merchantClient to api
        return response.data;
    },

    getDailyStats: async (): Promise<APIResponse<DailyStatResponse[]>> => {
        const response = await api.get('/wallet/statistics');
        return response.data;
    }
};

export default walletService;
