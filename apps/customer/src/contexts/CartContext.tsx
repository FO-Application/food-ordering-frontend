import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// Types matching backend OrderItem structure
export interface CartItemOption {
    id: number;
    name: string;
    price: number;
}

export interface CartItem {
    productId: number;
    productName: string;
    productImage: string;
    unitPrice: number;
    quantity: number;
    selectedOptions?: CartItemOption[];
    notes?: string;
    totalPrice?: number; // Calculated price (unit + options)
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
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    addToCart: (restaurant: RestaurantInfo, product: ProductInfo, quantity?: number, options?: CartItemOption[], notes?: string) => boolean;
    removeFromCart: (productIndex: number) => void;
    removeItems: (indices: number[]) => void;
    updateQuantity: (productIndex: number, quantity: number) => void;
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

    const [isCartOpen, setIsCartOpen] = useState(false);

    // Sync to localStorage
    useEffect(() => {
        if (cart && cart.items.length > 0) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } else {
            localStorage.removeItem(CART_STORAGE_KEY);
        }
    }, [cart]);

    const openCart = useCallback(() => setIsCartOpen(true), []);
    const closeCart = useCallback(() => setIsCartOpen(false), []);
    const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

    const addToCart = useCallback((restaurant: RestaurantInfo, product: ProductInfo, quantity: number = 1, options?: CartItemOption[], notes?: string): boolean => {
        const optionsTotal = (options || []).reduce((sum, opt) => sum + (opt.price || 0), 0);
        const totalPrice = product.price + optionsTotal;

        const buildItem = (): CartItem => ({
            productId: product.id,
            productName: product.name,
            productImage: product.imageUrl || '',
            unitPrice: product.price,
            quantity,
            selectedOptions: options && options.length > 0 ? options : undefined,
            notes: notes || undefined,
            totalPrice
        });

        // Helper: check if two option arrays are identical
        const optionsMatch = (a?: CartItemOption[], b?: CartItemOption[]): boolean => {
            const aIds = (a || []).map(o => o.id).sort((x, y) => x - y);
            const bIds = (b || []).map(o => o.id).sort((x, y) => x - y);
            if (aIds.length !== bIds.length) return false;
            return aIds.every((id, i) => id === bIds[i]);
        };

        setCart(prev => {
            // Different restaurant - replace cart
            if (prev && prev.restaurantId !== restaurant.id && prev.items.length > 0) {
                return {
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
                    restaurantSlug: restaurant.slug,
                    restaurantImage: restaurant.imageUrl,
                    items: [buildItem()]
                };
            }

            // Empty cart or same restaurant
            if (!prev || prev.items.length === 0) {
                return {
                    restaurantId: restaurant.id,
                    restaurantName: restaurant.name,
                    restaurantSlug: restaurant.slug,
                    restaurantImage: restaurant.imageUrl,
                    items: [buildItem()]
                };
            }

            // Same restaurant - check existing item with same product AND same options
            const existingIdx = prev.items.findIndex(item =>
                item.productId === product.id && optionsMatch(item.selectedOptions, options)
            );
            if (existingIdx >= 0) {
                const newItems = [...prev.items];
                newItems[existingIdx].quantity += quantity;
                return { ...prev, items: newItems };
            }

            return {
                ...prev,
                items: [...prev.items, buildItem()]
            };
        });

        // Auto open cart when adding item
        setIsCartOpen(true);
        return true;
    }, []);

    const removeFromCart = useCallback((itemIndex: number) => {
        setCart(prev => {
            if (!prev) return null;
            const newItems = [...prev.items];
            newItems.splice(itemIndex, 1);
            return newItems.length === 0 ? null : { ...prev, items: newItems };
        });
    }, []);

    const removeItems = useCallback((indices: number[]) => {
        setCart(prev => {
            if (!prev) return null;
            // Sort indices descending to remove from end first, avoiding index shift issues
            const sortedIndices = [...indices].sort((a, b) => b - a);
            const newItems = [...prev.items];

            sortedIndices.forEach(index => {
                if (index >= 0 && index < newItems.length) {
                    newItems.splice(index, 1);
                }
            });

            return newItems.length === 0 ? null : { ...prev, items: newItems };
        });
    }, []);

    const updateQuantity = useCallback((itemIndex: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemIndex);
            return;
        }
        setCart(prev => {
            if (!prev) return null;
            const newItems = [...prev.items];
            if (newItems[itemIndex]) {
                newItems[itemIndex].quantity = quantity;
            }
            return { ...prev, items: newItems };
        });
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        setCart(null);
        localStorage.removeItem(CART_STORAGE_KEY);
    }, []);

    const getCartTotal = useCallback((): number => {
        if (!cart) return 0;
        return cart.items.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice) * item.quantity, 0);
    }, [cart]);

    const getCartItemCount = useCallback((): number => {
        if (!cart) return 0;
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    return (
        <CartContext.Provider value={{
            cart,
            isCartOpen,
            openCart,
            closeCart,
            toggleCart,
            addToCart,
            removeFromCart,
            removeItems,
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
