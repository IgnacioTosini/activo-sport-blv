"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cart.store";
import { Title } from "@/components/ui/Title/Title";
import { CartItem } from "@/components/ui/cart/cartItem/CartItem";
import { formatCurrency } from "@/utils";
import { FaWhatsapp } from "react-icons/fa";
import { WhatsappCheckoutModal } from "@/components/checkout/whatsappCheckoutModal/WhatsappCheckoutModal";
import { CheckoutData } from "@/types/checkout.types";
import { handleWhatsappCheckout } from "@/helpers/whatsapp/handleWhatsappCheckout";
import "./_cartPage.scss";

export default function CartPage() {
    const [open, setOpen] = useState(false);
    const items = useCartStore((state) => state.items);
    const subtotal = useCartStore((state) => state.subtotal);
    const clearCart = useCartStore((state) => state.clearCart);

    const isEmpty = items.length === 0;
    const handleDirectPurchase = async (
        data: CheckoutData
    ) => {
        await handleWhatsappCheckout({
            ...data,
            subtotal: subtotal,
            items: items,
        });

        setOpen(false);
        clearCart();
    };

    return (
        <div className="cartPage">
            <div className="cartPageContainer">
                <Title text={"Carrito"} subTitle="TU PEDIDO" />

                {isEmpty ? (
                    <div className="cartEmptyState">
                        <p className="cartEmptyStateText">Tu carrito esta vacio.</p>
                        <Link href="/catalogo" className="cartEmptyStateLink">Ver catálogo</Link>
                    </div>
                ) : (
                    <div className="cartContent">
                        <ul className="cartItemsList">
                            {items.map((item) => (
                                <CartItem key={`${item.productId}-${item.sizeId}`} item={item} />
                            ))}
                        </ul>

                        <div className="cartSummary">
                            <h2>Resumen</h2>

                            <div className="cartSummaryRows">
                                <div className="cartSummaryRow">
                                    <span>Subtotal</span>
                                    <strong>{formatCurrency(subtotal)}</strong>
                                </div>
                                <div className="cartSummaryRow">
                                    <span>Envio</span>
                                    <strong>A coordinar</strong>
                                </div>
                            </div>

                            <div className="cartSummaryTotal">
                                <p>Total</p>
                                <strong>{formatCurrency(subtotal)}</strong>
                            </div>

                            <button
                                type="button"
                                className="productActionButton isWhatsapp"
                                onClick={() => {
                                    if (isEmpty) {
                                        return;
                                    }
                                    setOpen(true);
                                }}
                                disabled={isEmpty}
                            >
                                <FaWhatsapp />
                                COMPRAR POR WHATSAPP
                            </button>

                            <WhatsappCheckoutModal
                                open={open}
                                onClose={() => setOpen(false)}
                                onSubmit={handleDirectPurchase}
                            />

                            <p className="cartSummaryHint">Coordinamos envio y pago al toque por WhatsApp.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
