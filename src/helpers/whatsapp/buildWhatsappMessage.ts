import { CartItem } from "@/store/cart.store";

type Props = {
    orderId: string;
    customerName: string;
    phone: string;
    notes?: string;
    items: CartItem[];
    subtotal: number;
};

export function buildWhatsappMessage({
    orderId,
    customerName,
    phone,
    notes,
    items,
    subtotal,
}: Props) {
    const products = items
        .map(
            (item) =>
                `• ${item.name}
Talle: ${item.sizeLabel}
Cantidad: ${item.quantity}
Precio: $${item.price.toLocaleString("es-AR")}`
        )
        .join("\n\n");

    return `Hola.

Quiero confirmar el pedido #${orderId}

${products}

Total: $${subtotal.toLocaleString("es-AR")}

Nombre: ${customerName}
Telefono: ${phone}

${notes ? `Observaciones: ${notes}` : ""}`;
}