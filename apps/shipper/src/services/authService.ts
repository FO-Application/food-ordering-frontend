import api from '../utils/axiosConfig';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface ShipperRegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    dob: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    role: string;
    authenticated: boolean;
}

const authService = {
    login: async (data: LoginRequest) => {
        const response = await api.post<any>('/auth/login', data);
        return response.data;
    },

    signUpShipper: async (data: ShipperRegisterRequest) => {
        const response = await api.post<any>('/auth/sign-up/shipper', data);
        return response.data;
    },

    verifyOtpAndRegister: async (email: string, otpCode: string) => {
        const response = await api.post<any>('/auth/verify-otp-and-register', { email, otpCode });
        return response.data;
    },

    resendOtp: async (email: string, type: string) => {
        const response = await api.post<any>('/auth/resend-otp', { email, type });
        return response.data;
    },


    logout: async () => {
        const response = await api.post<any>('/auth/logout');
        return response.data;
    }
};

export default authService;
