import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CatalogCardProduct } from "@/components/ui/catalog/catalogCard/CatalogCard";
import { ALL_BRANDS, SurfaceOptionKey } from "./catalogFilters.constants";
import { CatalogFilterQuery } from "./catalogFilters.types";
import { buildCatalogFilterUrl } from "./catalogFilters.query";
import { normalizeText, toValidBrand, toValidPriceLimit, toValidSurface } from "./catalogFilters.utils";

type Params = {
    products: CatalogCardProduct[];
    brands: string[];
    initialFilters?: CatalogFilterQuery;
};

export function useCatalogFilters({ products, brands, initialFilters }: Params) {
    const router = useRouter();
    const pathname = usePathname();

    const maxAvailablePrice = useMemo(() => {
        if (products.length === 0) {
            return 0;
        }

        const maxPrice = Math.max(...products.map((product) => product.price));
        return Math.ceil(maxPrice / 1000) * 1000;
    }, [products]);

    const orderedBrandOptions = useMemo(() => {
        const uniqueBrands = Array.from(new Set(brands.filter(Boolean)));
        return [ALL_BRANDS, ...uniqueBrands];
    }, [brands]);

    const [search, setSearch] = useState(() => initialFilters?.search?.trim() ?? "");
    const [activeBrand, setActiveBrand] = useState(() =>
        toValidBrand(initialFilters?.brand?.trim(), orderedBrandOptions, ALL_BRANDS)
    );
    const [activeSurface, setActiveSurface] = useState<SurfaceOptionKey>(() =>
        toValidSurface(initialFilters?.surface?.trim())
    );
    const [priceLimit, setPriceLimit] = useState(() => toValidPriceLimit(initialFilters?.maxPrice, maxAvailablePrice));

    useEffect(() => {
        const targetUrl = buildCatalogFilterUrl(pathname, {
            search,
            activeBrand,
            activeSurface,
            priceLimit,
            maxAvailablePrice,
        });
        router.replace(targetUrl, { scroll: false });
    }, [search, activeBrand, activeSurface, priceLimit, maxAvailablePrice, pathname, router]);

    const filteredProducts = useMemo(() => {
        const searchValue = normalizeText(search);

        return products.filter((product) => {
            const brandName = product.brand?.name ?? "";
            const byBrand = activeBrand === ALL_BRANDS || brandName === activeBrand;
            const bySurface = activeSurface === "ALL" || product.surfaceType === activeSurface;
            const byPrice = product.price <= priceLimit;

            if (!searchValue) {
                return byBrand && bySurface && byPrice;
            }

            const bySearch =
                normalizeText(product.name).includes(searchValue) || normalizeText(brandName).includes(searchValue);

            return byBrand && bySurface && byPrice && bySearch;
        });
    }, [products, search, activeBrand, activeSurface, priceLimit]);

    const formattedPriceLimit = useMemo(() => {
        return new Intl.NumberFormat("es-AR").format(Math.max(0, Math.round(priceLimit)));
    }, [priceLimit]);

    return {
        search,
        setSearch,
        activeBrand,
        setActiveBrand,
        activeSurface,
        setActiveSurface,
        priceLimit,
        setPriceLimit,
        maxAvailablePrice,
        orderedBrandOptions,
        filteredProducts,
        formattedPriceLimit,
        hasProducts: products.length > 0,
    };
}
