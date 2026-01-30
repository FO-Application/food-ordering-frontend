import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// Types matching backend OrderItem structure
export interface CartItem {
    productId: number;
    productName: string;
    productImage: string;
    unitPrice: number;
    quantity: number;
}

export interface Cart {
    restaurantId: number;
    restaurantName: string;
    restaurantSlug: string;
    restaurantImage?: string;
    items: CartItem[];
}

export interface RestaurantInfo {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string;
}

export interface ProductInfo {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
}

interface CartContextType {
    cart: Cart | null;
    addToCart: (restaurant: RestaurantInfo, product: ProductInfo, quantity?: number) => boolean;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'fastbite_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<Cart | null>(() => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    // Sync to localStorage
    useEffect(() => {
        if (cart && cart.items.length > 0) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } else {
            localStorage.removeItem(CART_STORAGE_KEY);
        }
    }, [cart]);

    const addToCart = useCallback((restaurant: RestaurantInfo, product: ProductInfo, quantity: number = 1): boolean => {
        setCart(prev => {
            // Different restaurant - replace cart
            if (prev && prev.restaurantId !== restaurant.id && prev.items.length > 0) {
                return {
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
                    restaurantSlug: restaurant.slug,
                    restaurantImage: restaurant.imageUrl,
                    items: [{
                        productId: product.id,
                        productName: product.name,
                        productImage: product.imageUrl || '',
                        unitPrice: product.price,
                        quantity
                    }]
                };
            }

            // Empty cart or same restaurant
            if (!prev || prev.items.length === 0) {
                return {
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
                    restaurantSlug: restaurant.slug,
                    restaurantImage: restaurant.imageUrl,
                    items: [{
                        productId: product.id,
                        productName: product.name,
                        productImage: product.imageUrl || '',
                        unitPrice: product.price,
                        quantity
                    }]
                };
            }

            // Same restaurant - check existing item
            const existingIdx = prev.items.findIndex(item => item.productId === product.id);
            if (existingIdx >= 0) {
                const newItems = [...prev.items];
                newItems[existingIdx].quantity += quantity;
                return { ...prev, items: newItems };
            }

            return {
                ...prev,
                items: [...prev.items, {
                    productId: product.id,
                    productName: product.name,
                    productImage: product.imageUrl || '',
                    unitPrice: product.price,
                    quantity
                }]
            };
        });
        return true;
    }, []);

    const removeFromCart = useCallback((productId: number) => {
        setCart(prev => {
            if (!prev) return null;
            const newItems = prev.items.filter(item => item.productId !== productId);
            return newItems.length === 0 ? null : { ...prev, items: newItems };
        });
    }, []);

    const updateQuantity = useCallback((productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => {
            if (!prev) return null;
            return {
                ...prev,
                items: prev.items.map(item =>
                    item.productId === productId ? { ...item, quantity } : item
                )
            };
        });
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setCart(null);
        localStorage.removeItem(CART_STORAGE_KEY);
    }, []);

    const getCartTotal = useCallback((): number => {
        if (!cart) return 0;
        return cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    }, [cart]);

    const getCartItemCount = useCallback((): number => {
        if (!cart) return 0;
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartItemCount
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
