import { ALL_BRANDS, SurfaceOptionKey } from "./catalogFilters.constants";

type BuildCatalogFilterQueryParamsArgs = {
  search: string;
  activeBrand: string;
  activeSurface: SurfaceOptionKey;
  priceLimit: number;
  maxAvailablePrice: number;
};

export function buildCatalogFilterSearchParams({
  search,
  activeBrand,
  activeSurface,
  priceLimit,
  maxAvailablePrice,
}: BuildCatalogFilterQueryParamsArgs) {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set("q", search.trim());
  }

  if (activeBrand !== ALL_BRANDS) {
    params.set("brand", activeBrand);
  }

  if (activeSurface !== "ALL") {
    params.set("surface", activeSurface);
  }

  if (priceLimit < maxAvailablePrice) {
    params.set("max", String(Math.max(0, Math.round(priceLimit))));
  }

  return params;
}

export function buildCatalogFilterUrl(pathname: string, args: BuildCatalogFilterQueryParamsArgs) {
  const query = buildCatalogFilterSearchParams(args).toString();
  return query ? `${pathname}?${query}` : pathname;
}
