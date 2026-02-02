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
    // --- ĐĂNG KÝ ---

    /**
     * Đăng ký Customer (Bước 1)
     * Hệ thống sẽ gửi OTP về email
     */
    signUpCustomer: async (data: UserRequest): Promise<APIResponse<PendingUserResponse>> => {
        const response = await api.post<APIResponse<PendingUserResponse>>('/auth/sign-up/customer', data);
        return response.data;
    },

    /**
     * Đăng ký Merchant (Bước 1)
     */
    signUpMerchant: async (data: UserRequest): Promise<APIResponse<PendingUserResponse>> => {
        const response = await api.post<APIResponse<PendingUserResponse>>('/auth/sign-up/merchant', data);
        return response.data;
    },

    /**
     * Đăng ký Shipper (Bước 1)
     */
    signUpShipper: async (data: UserRequest): Promise<APIResponse<PendingUserResponse>> => {
        const response = await api.post<APIResponse<PendingUserResponse>>('/auth/sign-up/shipper', data);
        return response.data;
    },

    // --- XÁC THỰC OTP ---

    /**
     * Xác thực OTP & Kích hoạt tài khoản (Bước 2)
     * Gọi endpoint verify-otp-and-register để vừa xác thực OTP vừa kích hoạt tài khoản
     */
    verifyOtpAndRegister: async (data: VerifyOtpRequest): Promise<APIResponse<UserResponse>> => {
        const response = await api.post<APIResponse<UserResponse>>('/auth/verify-otp-and-register', data);
        return response.data;
    },

    /**
     * Gửi lại OTP
     * @param type - 'REGISTER' hoặc 'FORGOT_PASSWORD'
     */
    resendOtp: async (data: EmailRequest): Promise<APIResponse<void>> => {
        const response = await api.post<APIResponse<void>>('/auth/resend-otp', data);
        return response.data;
    },

    // --- ĐĂNG NHẬP ---

    /**
     * Đăng nhập bằng Email/Password
     * Cookies sẽ được tự động lưu bởi browser (HttpOnly)
     */
    login: async (data: AuthenticateRequest): Promise<APIResponse<AuthenticationResponse>> => {
        const response = await api.post<APIResponse<AuthenticationResponse>>('/auth/login', data);
        return response.data;
    },

    /**
     * Đăng nhập bằng Social (Google/Facebook)
     * Gửi Firebase ID Token
     */
    socialLogin: async (data: SocialLoginRequest): Promise<APIResponse<AuthenticationResponse>> => {
        const response = await api.post<APIResponse<AuthenticationResponse>>('/auth/outbound/social-login', data);
        return response.data;
    },

    // --- TOKEN MANAGEMENT ---

    /**
     * Refresh Token
     * Tự động đọc refresh_token từ Cookie
     */
    refreshToken: async (): Promise<APIResponse<AuthenticationResponse>> => {
        const response = await api.post<APIResponse<AuthenticationResponse>>('/auth/refresh');
        return response.data;
    },

    /**
     * Đăng xuất
     * Xóa cookies và invalidate token
     */
    logout: async (): Promise<APIResponse<void>> => {
        const response = await api.post<APIResponse<void>>('/auth/logout');
        return response.data;
    },

    // --- QUÊN MẬT KHẨU ---

    /**
     * Yêu cầu quên mật khẩu (Bước 1)
     * Gửi OTP về email
     */
    forgotPassword: async (email: string): Promise<APIResponse<void>> => {
        const response = await api.post<APIResponse<void>>(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
        return response.data;
    },

    /**
     * Xác thực OTP cho quên mật khẩu (Bước 2)
     * Trả về boolean: true nếu OTP hợp lệ, false nếu không hợp lệ
     */
    verifyForgotPasswordOtp: async (email: string, otpCode: string): Promise<APIResponse<boolean>> => {
        const response = await api.post<APIResponse<boolean>>(
            `/auth/verify-otp?email=${encodeURIComponent(email)}&otpCode=${encodeURIComponent(otpCode)}`
        );
        return response.data;
    },

    /**
     * Đặt lại mật khẩu mới (Bước 3)
     * Gửi kèm OTP đã xác thực để backend validate lại
     */
    resetPassword: async (data: NewPasswordRequest): Promise<APIResponse<void>> => {
        const response = await api.post<APIResponse<void>>('/auth/reset-password', data);
        return response.data;
    },
};

export default authService;
