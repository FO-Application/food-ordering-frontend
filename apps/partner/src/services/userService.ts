import api from '../utils/axiosConfig';

// User response from /user/me
export interface UserProfile {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dob?: string;
    role: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface APIResponse<T> {
    result?: T;
    message?: string;
    code?: number;
}

const userService = {
    /**
     * Get current authenticated user info
     * Endpoint: GET /user/me
     */
    getMyInfo: async (): Promise<APIResponse<UserProfile>> => {
        const response = await api.get<APIResponse<UserProfile>>('/user/me');
        return response.data;
    },

    /**
     * Update user profile by ID
     * Endpoint: PUT /user/{id}
     */
    updateUser: async (id: number, data: Partial<UserProfile>): Promise<APIResponse<UserProfile>> => {
        const response = await api.put<APIResponse<UserProfile>>(`/user/${id}`, data);
        return response.data;
    },
};

export default userService;
