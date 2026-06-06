import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteOrderAction, updateOrderStatusAction } from "@/actions/utils/orders";
import { Title } from "@/components/ui/Title/Title";
import { OrderStatus } from "@prisma/client";
import "./_orders.scss";

type AdminOrdersPageProps = {
    searchParams: Promise<{
        view?: string;
    }>;
};

const orderStatusLabel = {
    [OrderStatus.PENDING]: "Pendiente",
    [OrderStatus.CONFIRMED]: "Confirmado",
    [OrderStatus.SHIPPED]: "Enviado",
    [OrderStatus.DELIVERED]: "Entregado",
    [OrderStatus.CANCELLED]: "Cancelado",
};

export default async function OrdersPage({
    searchParams,
}: AdminOrdersPageProps) {
    const { view } = await searchParams;

    const orders = await prisma.order.findMany({
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

    const selectedOrder =
        view
            ? orders.find((order) => order.id === view) ?? null
            : null;

    return (
        <main className="adminOrders">
            <div className="adminOrdersContainer">
                <Link
                    href="/admin"
                    className="adminOrdersBackButton"
                >
                    ← Volver al panel principal
                </Link>

                <header className="adminOrdersHeader">
                    <div>
                        <Title
                            text="ADMINISTRADOR DE PEDIDOS"
                            subTitle="ABM Pedidos"
                        />

                        <p className="adminOrdersSubtitle">
                            Gestión de pedidos realizados por los clientes.
                        </p>
                    </div>

                    <div className="adminOrdersCountCard">
                        <span className="adminOrdersCountLabel">
                            Pedidos
                        </span>

                        <span className="adminOrdersCountValue">
                            {orders.length}
                        </span>
                    </div>
                </header>

                <section className="adminOrdersGrid">
                    <article className="adminOrdersCard">
                        <h2 className="adminOrdersCardTitle">
                            Listado
                        </h2>

                        <div className="adminOrdersTableWrap">
                            <table className="adminOrdersTable">
                                <thead>
                                    <tr className="adminOrdersTableHeader">
                                        <th>Cliente</th>
                                        <th>Teléfono</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Estado</th>
                                        <th>Fecha</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="adminOrdersEmptyCell"
                                            >
                                                <p className="adminOrdersEmpty">
                                                    No hay pedidos.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.id}>
                                                <td>{order.customerName}</td>

                                                <td>{order.phone}</td>

                                                <td>{order.items.length}</td>

                                                <td>
                                                    $
                                                    {Intl.NumberFormat(
                                                        "es-AR"
                                                    ).format(order.total)}
                                                </td>

                                                <td>
                                                    <span className={`adminOrdersBadge ${order.status.toLowerCase()}`}>
                                                        {orderStatusLabel[order.status as keyof typeof orderStatusLabel]}
                                                    </span>
                                                </td>

                                                <td>
                                                    {new Date(
                                                        order.createdAt
                                                    ).toLocaleDateString("es-AR")}
                                                </td>

                                                <td>
                                                    <div className="adminOrdersActions">
                                                        <Link
                                                            href={`/admin/orders?view=${order.id}`}
                                                            className="adminOrdersLinkButton"
                                                        >
                                                            Ver
                                                        </Link>

                                                        <form
                                                            action={deleteOrderAction}
                                                        >
                                                            <input
                                                                type="hidden"
                                                                name="orderId"
                                                                value={order.id}
                                                            />

                                                            <button
                                                                type="submit"
                                                                className="adminOrdersDangerButton"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="adminOrdersCard">
                        {selectedOrder ? (
                            <>
                                <h2 className="adminOrdersCardTitle">
                                    Detalle del Pedido
                                </h2>

                                <div className="adminOrdersDetails">
                                    <div className="adminOrdersField">
                                        <strong>ID</strong>
                                        <span>{selectedOrder.id}</span>
                                    </div>

                                    <div className="adminOrdersField">
                                        <strong>Cliente</strong>
                                        <span>{selectedOrder.customerName}</span>
                                    </div>

                                    <div className="adminOrdersField">
                                        <strong>Teléfono</strong>
                                        <span>{selectedOrder.phone}</span>
                                    </div>

                                    <div className="adminOrdersField">
                                        <strong>Total</strong>
                                        <span>
                                            $
                                            {Intl.NumberFormat(
                                                "es-AR"
                                            ).format(selectedOrder.total)}
                                        </span>
                                    </div>

                                    <div className="adminOrdersField">
                                        <strong>Fecha</strong>
                                        <span>
                                            {new Date(
                                                selectedOrder.createdAt
                                            ).toLocaleString("es-AR")}
                                        </span>
                                    </div>

                                    <form
                                        action={updateOrderStatusAction}
                                        className="adminOrdersStatusForm"
                                    >
                                        <input
                                            type="hidden"
                                            name="orderId"
                                            value={selectedOrder.id}
                                        />

                                        <label htmlFor="status">
                                            Estado
                                        </label>

                                        <select
                                            id="status"
                                            name="status"
                                            defaultValue={selectedOrder.status}
                                        >
                                            <option value={OrderStatus.PENDING}>
                                                Pendiente
                                            </option>

                                            <option value={OrderStatus.CONFIRMED}>
                                                Confirmado
                                            </option>

                                            <option value={OrderStatus.SHIPPED}>
                                                Enviado
                                            </option>

                                            <option value={OrderStatus.DELIVERED}>
                                                Entregado
                                            </option>

                                            <option value={OrderStatus.CANCELLED}>
                                                Cancelado
                                            </option>
                                        </select>

                                        <button
                                            type="submit"
                                            className="adminOrdersLinkButton"
                                        >
                                            Actualizar estado
                                        </button>
                                    </form>

                                    <p className="adminOrdersNotes">
                                        <strong>Notas</strong>{" "}
                                        {selectedOrder.notes || "Ninguna"}
                                    </p>

                                    <h3 className="adminOrdersItemsTitle">
                                        Productos
                                    </h3>

                                    <div className="adminOrdersItems">
                                        {selectedOrder.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="adminOrdersItem"
                                            >
                                                <p className="adminOrdersItemName">
                                                    {item.product.name}
                                                </p>

                                                <p className="adminOrdersItemInfo">
                                                    Cantidad: {item.quantity}
                                                </p>

                                                <p className="adminOrdersItemInfo">
                                                    Precio unitario: $
                                                    {Intl.NumberFormat(
                                                        "es-AR"
                                                    ).format(item.price)}
                                                </p>

                                                <p className="adminOrdersItemInfo">
                                                    Talle EUR {item.size.eurSize}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="adminOrdersCardTitle">
                                    Detalle
                                </h2>

                                <p className="adminOrdersEmpty">
                                    Selecciona un pedido para ver sus detalles.
                                </p>
                            </>
                        )}
                    </article>
                </section>
            </div>
        </main>
    );
}