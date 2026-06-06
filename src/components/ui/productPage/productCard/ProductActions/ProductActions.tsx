"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useCartStore } from "@/store/cart.store";
import { WhatsappCheckoutModal } from "@/components/checkout/whatsappCheckoutModal/WhatsappCheckoutModal";
import { handleWhatsappCheckout } from "@/helpers/whatsapp/handleWhatsappCheckout";
import { CheckoutData } from "@/types/checkout.types";
import "./_productActions.scss";

type Props = {
    productId: string;
    slug: string;
    productName: string;
    productBrand: string;
    productPrice: number;
    productImage: string;
    selectedSizeId: string;
    selectedSizeLabel: string;
    canAddToCart: boolean;
};

export const ProductActions = ({
    productId,
    slug,
    productName,
    productBrand,
    productPrice,
    productImage,
    selectedSizeId,
    selectedSizeLabel,
    canAddToCart,
}: Props) => {
    const addItem = useCartStore((state) => state.addItem);

    const [open, setOpen] = useState(false);

    const handleAddToCart = () => {
        if (!canAddToCart || !selectedSizeId) {
            return;
        }

        addItem({
            productId,
            slug,
            sizeId: selectedSizeId,
            sizeLabel: selectedSizeLabel,
            brand: productBrand,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1,
        });
    };

    const handleDirectPurchase = async (
        data: CheckoutData
    ) => {
        await handleWhatsappCheckout({
            ...data,
            subtotal: productPrice,
            items: [
                {
                    productId,
                    slug,
                    sizeId: selectedSizeId,
                    sizeLabel: selectedSizeLabel,
                    brand: productBrand,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1,
                },
            ],
        });

        setOpen(false);
    };

    return (
        <div className="productActions">
            <button
                type="button"
                className="productActionButton isPrimary"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
            >
                <HiOutlineShoppingBag />
                AGREGAR AL CARRITO
            </button>

            <button
                type="button"
                className="productActionButton isWhatsapp"
                onClick={() => {
                    if (!canAddToCart || !selectedSizeId) {
                        return;
                    }
                    setOpen(true);
                }}
                disabled={!canAddToCart}
            >
                <FaWhatsapp />
                COMPRAR POR WHATSAPP
            </button>

            <WhatsappCheckoutModal
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={handleDirectPurchase}
            />
        </div>
    );
};