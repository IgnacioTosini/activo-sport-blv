"use server";

import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

type CreateOrderInput = {
    customerName: string;
    phone: string;
    notes?: string;

    items: {
        productId: string;
        sizeId: string;
        quantity: number;
    }[];
};

export async function createOrderAction(data: CreateOrderInput) {
    return prisma.$transaction(async (tx) => {
        if (data.items.length === 0) {
            return {
                ok: false,
                message: "El carrito está vacío.",
            };
        }

        let total = 0;

        const itemsWithData: {
            productId: string;
            sizeId: string;
            quantity: number;
            price: number;
        }[] = [];

        // 🔥 1. VALIDACIÓN + DESCUENTO ATÓMICO
        for (const item of data.items) {
            const product = await tx.product.findUnique({
                where: { id: item.productId },
            });

            if (!product) {
                return {
                    ok: false,
                    message: "Producto no encontrado.",
                };
            }

            // 💥 CLAVE: operación atómica (evita overselling)
            const stockUpdated = await tx.stock.updateMany({
                where: {
                    productId: item.productId,
                    sizeId: item.sizeId,
                    quantity: {
                        gte: item.quantity,
                    },
                },
                data: {
                    quantity: {
                        decrement: item.quantity,
                    },
                },
            });

            if (stockUpdated.count === 0) {
                return {
                    ok: false,
                    message: `Stock insuficiente para ${product.name}.`,
                };
            }

            total += product.price * item.quantity;

            itemsWithData.push({
                productId: item.productId,
                sizeId: item.sizeId,
                quantity: item.quantity,
                price: product.price,
            });
        }

        // 🔥 2. CREAR ORDER (solo si todo salió bien)
        const order = await tx.order.create({
            data: {
                customerName: data.customerName,
                phone: data.phone,
                notes: data.notes,
                total,
                status: OrderStatus.PENDING,
                items: {
                    create: itemsWithData,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                        size: true,
                    },
                },
            },
        });

        // 🔥 3. REVALIDACIÓN
        revalidatePath("/admin/orders");
        revalidatePath("/");
        revalidatePath("/catalogo");

        return {
            ok: true,
            order,
        };
    });
}

export async function updateOrderStatusAction(
    formData: FormData
) {
    const orderId = String(formData.get("orderId"));

    const status = formData.get(
        "status"
    ) as OrderStatus;

    await prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            status,
        },
    });

    revalidatePath("/admin/orders");
}

export async function deleteOrderAction(
    formData: FormData
) {
    const orderId = String(
        formData.get("orderId")
    );

    if (!orderId) {
        return;
    }

    await prisma.order.delete({
        where: {
            id: orderId,
        },
    });

    revalidatePath("/admin/orders");
}

export async function getAllOrders() {
    return prisma.order.findMany({
        include: {
            user: true,
            items: {
                include: {
                    product: true,
                    size: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function getOrderById(
    orderId: string
) {
    return prisma.order.findUnique({
        where: {
            id: orderId,
        },
        include: {
            user: true,
            items: {
                include: {
                    product: true,
                    size: true,
                },
            },
        },
    });
}