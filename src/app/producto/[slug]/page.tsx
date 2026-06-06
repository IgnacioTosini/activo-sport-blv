import { getProductBySlug } from "@/actions/products";
import { ProductCard } from "@/components/ui/productPage/productCard";
import Link from "next/link";
import "./_productPage.scss";

interface Props {
    params: Promise<{
        slug: string;
    }>;
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
        return (
            <div className="productPage">
                <div className="productPageContainer">
                    <p>Producto no encontrado.</p>
                    <Link href="/catalogo">Volver al catálogo</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="productPage">
            <div className="productPageContainer">
                <Link className="productPageBack" href="/catalogo">← Volver al catálogo</Link>
                <ProductCard product={product} />
            </div>
        </div>
    );
}