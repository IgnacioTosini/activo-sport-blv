import Link from "next/link";
import { LuBoxes, LuClipboardList } from "react-icons/lu";
import { prisma } from "@/lib/prisma";
import "./_admin.scss";

const adminCards = [
  {
    title: "Productos",
    description: "Gestionar catalogo, precios y stock",
    href: "/admin/products",
    Icon: LuBoxes,
  },
  {
    title: "Ordenes",
    description: "Pedidos, envios y pagos",
    href: "/admin/orders",
    Icon: LuClipboardList,
  },
  /* {
    title: "Resenas",
    description: "Comentarios y calificaciones",
    href: "/admin/reviews",
    Icon: LuStar,
  }, */
] as const;

export default async function AdminPage() {
  const [productCount, orderCount, reviewCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.review.count(),
  ]);

  const counts = [productCount, orderCount, reviewCount];

  return (
    <main className="adminAccess">
      <section className="adminAccessContainer">
        <h1 className="adminAccessTitle">Accesos directos</h1>

        <div className="adminAccessGrid">
          {adminCards.map((card, index) => (
            <Link key={card.title} href={card.href} className="adminAccessCard">
              <div className="adminAccessCardTop">
                <span className="adminAccessIconWrap">
                  <card.Icon size={24} />
                </span>
                <span className="adminAccessArrow">↗</span>
              </div>

              <div className="adminAccessCardBody">
                <h2 className="adminAccessCardTitle">{card.title}</h2>
                <p className="adminAccessCardDescription">{card.description}</p>
                <p className="adminAccessCardCount">
                  {counts[index]} registro{counts[index] !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
