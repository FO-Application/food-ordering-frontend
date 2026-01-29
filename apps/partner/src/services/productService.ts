
import api from '../utils/axiosConfig';

// ==================== RESPONSE TYPES (from Backend) ====================

export interface CategoryResponse {
    id: number;
    name: string;
    displayOrder: number;
    isActive: boolean;
    restaurantName: string;
}

export interface ProductResponse {
    id: number;
    name: string;
    description: string;
    price: number;           // BigDecimal -> number
    originalPrice: number;   // BigDecimal -> number
    imageUrl: string;
    status: boolean;         // Backend uses 'status', not 'isActive'
    categoryName: string;
    optionGroups?: OptionGroupResponse[];
}

export interface OptionGroupResponse {
    id: number;
    name: string;
    isMandatory: boolean;
    minSelection: number;
    maxSelection: number;
    productName: string;
    options?: OptionItemResponse[];
}

export interface OptionItemResponse {
    id: number;
    name: string;
    priceAdjustment: number; // Backend uses 'priceAdjustment'
    isAvailable: boolean;
    optionGroupName: string;
}

// ==================== REQUEST TYPES (to Backend) ====================

export interface CategoryRequest {
    name: string;
    displayOrder: number;
    idRestaurant: number;  // Backend uses 'idRestaurant', NOT 'restaurantSlug'
}

export interface ProductRequest {
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    categoryId: number;
}

export interface OptionGroupRequest {
    name: string;
    minSelection: number;
    isMandatory: boolean;
    maxSelection: number;
    productId: number;
}

export interface OptionItemRequest {
    name: string;
    priceAdjustment: number;  // Backend uses 'priceAdjustment'
    optionGroupId: number;
}

// ==================== SERVICE ====================

const productService = {
    // --- CATEGORY API ---
    getAllCategories: async (slug: string): Promise<any> => {
        const response = await api.get(`/category/restaurant/${slug}`);
        return response.data;
    },

    createCategory: async (data: CategoryRequest): Promise<any> => {
        const response = await api.post('/category', data);
        return response.data;
    },

    updateCategory: async (id: number, data: Partial<CategoryRequest>): Promise<any> => {
        const response = await api.put(`/category/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: number): Promise<any> => {
        const response = await api.delete(`/category/${id}`);
        return response.data;
    },

    // --- PRODUCT API ---
    getProductsByCategory: async (categoryId: number): Promise<any> => {
        const response = await api.get(`/product/category/${categoryId}`);
        return response.data;
    },

    createProduct: async (data: ProductRequest, imageFile: File): Promise<any> => {
        const formData = new FormData();
        const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        formData.append('data', jsonBlob);
        formData.append('image', imageFile);

        return api.post('/product', formData, {
            headers: { 'Content-Type': undefined }
        }).then(res => res.data);
    },

    updateProduct: async (id: number, data: Partial<ProductRequest>, imageFile?: File): Promise<any> => {
        const formData = new FormData();
        const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        formData.append('data', jsonBlob);

        if (imageFile) {
            formData.append('image', imageFile);
        }

        return api.put(`/product/${id}`, formData, {
            headers: { 'Content-Type': undefined }
        }).then(res => res.data);
    },

    deleteProduct: async (id: number): Promise<any> => {
        const response = await api.delete(`/product/${id}`);
        return response.data;
    },

    // --- OPTION GROUP API ---
    getOptionGroupsByProduct: async (productId: number): Promise<any> => {
        const response = await api.get(`/option-group/product/${productId}`);
        return response.data;
    },

    createOptionGroup: async (data: OptionGroupRequest): Promise<any> => {
        const response = await api.post('/option-group', data);
        return response.data;
    },

    updateOptionGroup: async (id: number, data: Partial<OptionGroupRequest>): Promise<any> => {
        const response = await api.put(`/option-group/${id}`, data);
        return response.data;
    },

    deleteOptionGroup: async (id: number): Promise<any> => {
        const response = await api.delete(`/option-group/${id}`);
        return response.data;
    },

    // --- OPTION ITEM API ---
    getOptionItemsByGroup: async (groupId: number): Promise<any> => {
        const response = await api.get(`/option-item/group/${groupId}`);
        return response.data;
    },

    createOptionItem: async (data: OptionItemRequest): Promise<any> => {
        const response = await api.post('/option-item', data);
        return response.data;
    },

    updateOptionItem: async (id: number, data: Partial<OptionItemRequest>): Promise<any> => {
        const response = await api.put(`/option-item/${id}`, data);
        return response.data;
    },

    deleteOptionItem: async (id: number): Promise<any> => {
        const response = await api.delete(`/option-item/${id}`);
        return response.data;
    }
};

export default productService;
