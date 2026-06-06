import { createOrderAction } from "@/actions/utils/orders";
import { CheckoutData } from "@/types/checkout.types";
import { CartItem } from "@/store/cart.store";
import { buildWhatsappMessage } from "./buildWhatsappMessage";
import { getWhatsappUrl } from "./getWhatsappUrl";

type Props = CheckoutData & {
    items: CartItem[];
    subtotal: number;
};

export async function handleWhatsappCheckout({
    customerName,
    phone,
    notes,
    items,
    subtotal,
}: Props) {
    try {
        const order = await createOrderAction({
            customerName,
            phone,
            notes,
            items: items.map((item) => ({
                productId: item.productId,
                sizeId: item.sizeId,
                quantity: item.quantity,
            })),
        });

        const message = buildWhatsappMessage({
            orderId: order.id,
            customerName,
            phone,
            notes,
            items,
            subtotal,
        });

        window.open(
            getWhatsappUrl(
                process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "",
                message
            ),
            "_blank"
        );

        return order;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : "No fue posible crear el pedido."
        );
    }
}