import { SurfaceOptionKey, SURFACE_OPTIONS } from "./catalogFilters.constants";

export function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function toValidBrand(initialBrand: string | undefined, options: string[], fallback: string) {
  if (!initialBrand) {
    return fallback;
  }

  return options.includes(initialBrand) ? initialBrand : fallback;
}

export function toValidSurface(initialSurface: string | undefined): SurfaceOptionKey {
  if (!initialSurface) {
    return "ALL";
  }

  const validSurfaceKeys = new Set<SurfaceOptionKey>(SURFACE_OPTIONS.map((surface) => surface.key));
  return validSurfaceKeys.has(initialSurface as SurfaceOptionKey) ? (initialSurface as SurfaceOptionKey) : "ALL";
}

export function toValidPriceLimit(candidate: number | undefined, maxAvailablePrice: number) {
  if (typeof candidate !== "number" || !Number.isFinite(candidate)) {
    return maxAvailablePrice;
  }

  const rounded = Math.round(candidate);
  return Math.min(Math.max(0, rounded), maxAvailablePrice);
}
