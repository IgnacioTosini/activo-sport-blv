"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
    productId: string;
    slug: string;
    sizeId: string;
    sizeLabel: string;
    brand: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
};

type AddCartItemInput = Omit<CartItem, "quantity"> & {
    quantity?: number;
};

type CartState = {
    items: CartItem[];
    totalItems: number;
    subtotal: number;
    addItem: (item: AddCartItemInput) => void;
    updateItemQuantity: (productId: string, sizeId: string, quantity: number) => void;
    removeItem: (productId: string, sizeId: string) => void;
    clearCart: () => void;
};

function calculateTotals(items: CartItem[]) {
    return {
        totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
        subtotal: items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    };
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            totalItems: 0,
            subtotal: 0,
            addItem: (item) => {
                const safeQuantity = item.quantity && item.quantity > 0 ? item.quantity : 1;

                set((state) => {
                    const existingIndex = state.items.findIndex(
                        (cartItem) => cartItem.productId === item.productId && cartItem.sizeId === item.sizeId
                    );

                    let nextItems: CartItem[];

                    if (existingIndex >= 0) {
                        nextItems = state.items.map((cartItem, index) =>
                            index === existingIndex
                                ? { ...cartItem, quantity: cartItem.quantity + safeQuantity }
                                : cartItem
                        );
                    } else {
                        nextItems = [...state.items, { ...item, quantity: safeQuantity }];
                    }

                    return {
                        items: nextItems,
                        ...calculateTotals(nextItems),
                    };
                });
            },
            updateItemQuantity: (productId, sizeId, quantity) => {
                set((state) => {
                    const safeQuantity = Math.max(0, Math.floor(quantity));

                    const nextItems =
                        safeQuantity === 0
                            ? state.items.filter((item) => !(item.productId === productId && item.sizeId === sizeId))
                            : state.items.map((item) =>
                                item.productId === productId && item.sizeId === sizeId
                                    ? { ...item, quantity: safeQuantity }
                                    : item
                            );

                    return {
                        items: nextItems,
                        ...calculateTotals(nextItems),
                    };
                });
            },
            removeItem: (productId, sizeId) => {
                set((state) => {
                    const nextItems = state.items.filter(
                        (item) => !(item.productId === productId && item.sizeId === sizeId)
                    );

                    return {
                        items: nextItems,
                        ...calculateTotals(nextItems),
                    };
                });
            },
            clearCart: () => {
                set({ items: [], totalItems: 0, subtotal: 0 });
            },
        }),
        {
            name: "active-sport-cart",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
