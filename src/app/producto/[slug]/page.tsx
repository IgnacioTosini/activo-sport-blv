import type { Metadata } from "next";
import { getProductBySlug } from "@/actions/products";
import { ProductCard } from "@/components/ui/productPage/productCard";
import Link from "next/link";
import "./_productPage.scss";

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const { slug } = await params;

    const product = await getProductBySlug(slug);

    if (!product) {
        return {
            title: "Producto no encontrado",
            description: "El producto solicitado no existe.",
        };
    }

    return {
        title: `${product.name} | Activo Sport BLV`,
        description: product.description,

        openGraph: {
            title: product.name,
            description: product.description,
            url: `/producto/${product.slug}`,
            siteName: "Activo Sport BLV",
            images: [
                {
                    url: product.mainImage,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                },
            ],
            locale: "es_AR",
            type: "website",
        },

        twitter: {
            card: "summary_large_image",
            title: product.name,
            description: product.description,
            images: [product.mainImage],
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        return (
            <div className="productPage">
                <div className="productPageContainer">
                    <p>Producto no encontrado.</p>
                    <Link href="/catalogo">
                        Volver al catálogo
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="productPage">
            <div className="productPageContainer">
                <Link
                    className="productPageBack"
                    href="/catalogo"
                >
                    ← Volver al catálogo
                </Link>

                <ProductCard product={product} />
            </div>
        </div>
    );
}