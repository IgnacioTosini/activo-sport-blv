import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { createProductAction, toggleProductStatusAction, updateProductAction } from "@/actions/products";
import { ProductForm } from "@/components/admin/productForm/ProductForm";
import { surfaceTypeLabel } from "@/utils/glossary";
import { Title } from "@/components/ui/Title/Title";
import "./_adminProducts.scss";

type ProductsPageProps = {
    searchParams: Promise<{ edit?: string; updated?: string }>;
};

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
    const { edit, updated } = await searchParams;

    const [products, sizes, brands, categories] = await Promise.all([
        prisma.product.findMany({
            include: {
                brand: true,
                category: true,
                stock: {
                    include: {
                        size: true,
                    },
                    orderBy: {
                        size: {
                            usSize: "asc",
                        },
                    },
                },
                images: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        }),
        prisma.size.findMany({
            orderBy: {
                usSize: "asc",
            },
        }),
        prisma.brand.findMany({
            orderBy: {
                name: "asc",
            },
        }),
        prisma.category.findMany({
            orderBy: {
                name: "asc",
            },
        }),
    ]);

    const editingProduct = edit
        ? products.find((product) => product.id === edit) ?? null
        : null;

    return (
        <main className="adminProducts">
            <div className="adminProductsContainer">
                <Link href="/admin" className="adminProductsBackButton">
                    ← Volver al panel principal
                </Link>
                <header className="adminProductsHeader">
                    <div>
                        <Title text={"ADMINISTRADOR DE PRODUCTOS"} subTitle="ABM Productos" />
                        <p className="adminProductsSubtitle">
                            Alta, baja y modificación de productos con Next Actions y Prisma. Crea o edita modelos,
                            marca/categoría, imágenes y stock por talle.
                        </p>
                    </div>
                    <div className="adminProductsCountCard">
                        <span className="adminProductsCountLabel">Registros</span>
                        <span className="adminProductsCountValue">{products.length}</span>
                    </div>
                </header>

                <section className="adminProductsGrid">
                    <article className="adminProductsCard">
                        <h2 className="adminProductsCardTitle">Listado</h2>
                        <div className="adminProductsTableWrap">
                            <table className="adminProductsTable">
                                <thead>
                                    <tr className="adminProductsTableHeader">
                                        <th>Modelo</th>
                                        <th>Marca</th>
                                        <th>Suela</th>
                                        <th>Precio</th>
                                        <th>Stock</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="adminProductsEmptyCell">
                                                <p className="adminProductsEmpty">Aun no hay productos cargados.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((product) => {
                                            const totalStock = product.stock.reduce((acc, item) => acc + item.quantity, 0);

                                            return (
                                                <tr key={product.id} className={
                                                    !product.isActive
                                                        ? "adminProductsRowDisabled"
                                                        : ""
                                                }>
                                                    <td>
                                                        <div className="adminProductsModelCell">
                                                            <Image
                                                                src={product.mainImage}
                                                                alt={product.name}
                                                                width={58}
                                                                height={58}
                                                                className="adminProductsThumbnail"
                                                                unoptimized
                                                            />
                                                            <div>
                                                                <strong>{product.name}</strong>
                                                                <p className="adminProductsSlug">{product.slug}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{product.brand.name}</td>
                                                    <td>
                                                        <span className="adminProductsBadge">{surfaceTypeLabel[product.surfaceType]}</span>
                                                    </td>
                                                    <td className="adminProductsPrice">${Intl.NumberFormat("es-AR").format(product.price)}</td>
                                                    <td>
                                                        <span className={totalStock > 0 ? "adminProductsBadge" : "adminProductsBadge isMuted"}>
                                                            {totalStock}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="adminProductsActions">
                                                            <Link href={`/admin/products?edit=${product.id}`} className="adminProductsLinkButton">
                                                                Editar
                                                            </Link>
                                                            <form action={toggleProductStatusAction}>
                                                                <input type="hidden" name="productId" value={product.id} />
                                                                <button
                                                                    type="submit"
                                                                    className={
                                                                        product.isActive
                                                                            ? "adminProductsDangerButton"
                                                                            : "adminProductsLinkButton"
                                                                    }
                                                                >
                                                                    {product.isActive ? "Desactivar" : "Restaurar"}
                                                                </button>
                                                            </form>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="adminProductsCard">
                        <ProductForm
                            key={editingProduct?.id ?? "new"}
                            sizes={sizes}
                            brandOptions={brands.map((brand) => brand.name)}
                            categoryOptions={categories.map((category) => category.name)}
                            editingProduct={editingProduct}
                            createAction={createProductAction}
                            updateAction={updateProductAction}
                            updated={updated === "1"}
                        />
                    </article>
                </section>
            </div>
        </main>
    );
}
