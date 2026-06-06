"use client";

import { CatalogGrid } from "@/components/ui/catalogGrid/CatalogGrid";
import { CatalogCardProduct } from "@/components/ui/catalog/catalogCard/CatalogCard";
import { CatalogFiltersHeader } from "./CatalogFiltersHeader";
import { CatalogFiltersToolbar } from "./CatalogFiltersToolbar";
import { CatalogFiltersRange } from "./CatalogFiltersRange";
import { useCatalogFilters } from "./useCatalogFilters";
import { CatalogFilterQuery } from "./catalogFilters.types";
import "./_catalogFilters.scss";

type Props = {
  products: CatalogCardProduct[];
  brands: string[];
  initialFilters?: CatalogFilterQuery;
};

export const CatalogFilters = ({ products, brands, initialFilters }: Props) => {
  const {
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
    hasProducts,
  } = useCatalogFilters({ products, brands, initialFilters });

  return (
    <section className="catalogFiltersSection">
      <div className="catalogFiltersContainer">
        <CatalogFiltersHeader
          search={search}
          onSearchChange={setSearch}
          total={filteredProducts.length}
        />

        <CatalogFiltersToolbar
          orderedBrandOptions={orderedBrandOptions}
          activeBrand={activeBrand}
          onBrandChange={setActiveBrand}
          activeSurface={activeSurface}
          onSurfaceChange={setActiveSurface}
        />

        <CatalogFiltersRange
          priceLimit={priceLimit}
          maxAvailablePrice={maxAvailablePrice}
          formattedPriceLimit={formattedPriceLimit}
          hasProducts={hasProducts}
          onPriceLimitChange={setPriceLimit}
        />

        <CatalogGrid products={filteredProducts} />
      </div>
    </section>
  );
};
