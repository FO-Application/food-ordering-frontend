
import api from '../utils/axiosConfig';

// ==================== TYPES ====================

export interface UserRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    dob: string; // Format: YYYY-MM-DD
}

export interface AuthenticateRequest {
    email: string;
    password: string;
}

export interface SocialLoginRequest {
    token: string;
}

export interface VerifyOtpRequest {
    email: string;
    otpCode: string;
}

export interface EmailRequest {
    email: string;
    type: 'REGISTER' | 'FORGOT_PASSWORD';
}

export interface NewPasswordRequest {
    email: string;
    newPassword: string;
    otp: string;
}

export interface AuthenticationResponse {
    accessToken: string;
    refreshToken: string;
    role: string;
    authenticated: boolean;
}

export interface APIResponse<T> {
    result?: T;
    message: string;
    code?: number;
}

export interface PendingUserResponse {
    email: string;
    firstName: string;
    lastName: string;
}

export interface UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    dob: string;
    role: string;
}

// ==================== AUTH SERVICE ====================

const authService = {
    // --- ĐĂNG KÝ MERCHANT ---
    signUpMerchant: async (data: UserRequest): Promise<APIResponse<PendingUserResponse>> => {
        const response = await api.post<APIResponse<PendingUserResponse>>('/auth/sign-up/merchant', data);
        return response.data;
    },

    // --- XÁC THỰC OTP ---
    verifyOtpAndRegister: async (data: VerifyOtpRequest): Promise<APIResponse<UserResponse>> => {
        const response = await api.post<APIResponse<UserResponse>>('/auth/verify-otp-and-register', data);
        return response.data;
    },

    resendOtp: async (data: EmailRequest): Promise<APIResponse<void>> => {
        const response = await api.post<APIResponse<void>>('/auth/resend-otp', data);
        return response.data;
    },

    // --- ĐĂNG NHẬP ---
    login: async (data: AuthenticateRequest): Promise<APIResponse<AuthenticationResponse>> => {
        const response = await api.post<APIResponse<AuthenticationResponse>>('/auth/login', data);
        return response.data;
    },

    socialLogin: async (data: SocialLoginRequest): Promise<APIResponse<AuthenticationResponse>> => {
        const response = await api.post<APIResponse<AuthenticationResponse>>('/auth/outbound/social-login', data);
        return response.data;
    },

    // --- TOKEN MANAGEMENT ---
    refreshToken: async (): Promise<APIResponse<AuthenticationResponse>> => {
        const response = await api.post<APIResponse<AuthenticationResponse>>('/auth/refresh');
        return response.data;
    },

    logout: async (): Promise<APIResponse<void>> => {
        const response = await api.post<APIResponse<void>>('/auth/logout');
        return response.data;
    },

    // --- QUÊN MẬT KHẨU ---
    forgotPassword: async (email: string): Promise<APIResponse<void>> => {
        const response = await api.post<APIResponse<void>>(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
        return response.data;
    },

    verifyForgotPasswordOtp: async (email: string, otpCode: string): Promise<APIResponse<boolean>> => {
        const response = await api.post<APIResponse<boolean>>(
            `/auth/verify-otp?email=${encodeURIComponent(email)}&otpCode=${encodeURIComponent(otpCode)}`
        );
        return response.data;
    },

    resetPassword: async (data: NewPasswordRequest): Promise<APIResponse<void>> => {
        const response = await api.post<APIResponse<void>>('/auth/reset-password', data);
        return response.data;
    },
};

export default authService;
