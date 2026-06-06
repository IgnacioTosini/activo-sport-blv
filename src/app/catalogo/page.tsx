
import { fetchBrands } from "@/actions/brands";
import { getAllProducts } from "@/actions/products";
import { CatalogFilters } from "@/components/sections";

type CatalogPageProps = {
    searchParams: Promise<{
        q?: string;
        brand?: string;
        surface?: string;
        max?: string;
    }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
    const { q, brand, surface, max } = await searchParams;
    const [brands, products] = await Promise.all([fetchBrands(), getAllProducts()]);
    const parsedMaxPrice = Number(max);

    return (
        <main>
            <CatalogFilters
                products={products}
                brands={brands.map((brand) => brand.name)}
                initialFilters={{
                    search: q,
                    brand,
                    surface,
                    maxPrice: Number.isFinite(parsedMaxPrice) ? parsedMaxPrice : undefined,
                }}
            />
        </main>
    );
}