import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { SURFACE_OPTIONS, SurfaceOptionKey } from "./catalogFilters.constants";

type Props = {
    orderedBrandOptions: string[];
    activeBrand: string;
    onBrandChange: (brand: string) => void;
    activeSurface: SurfaceOptionKey;
    onSurfaceChange: (surface: SurfaceOptionKey) => void;
};

export const CatalogFiltersToolbar = ({
    orderedBrandOptions,
    activeBrand,
    onBrandChange,
    activeSurface,
    onSurfaceChange,
}: Props) => {
    return (
        <div className="catalogFiltersToolbar">
            <div className="catalogFiltersGroup">
                <span className="catalogFiltersLabel">
                    <HiAdjustmentsHorizontal aria-hidden="true" />
                    FILTROS:
                </span>
                <div className="catalogFiltersPills">
                    {orderedBrandOptions.map((brand) => (
                        <button
                            key={brand}
                            type="button"
                            className={`catalogFiltersPill ${activeBrand === brand ? "isActive" : ""}`}
                            onClick={() => onBrandChange(brand)}
                        >
                            {brand}
                        </button>
                    ))}
                </div>
            </div>

            <div className="catalogFiltersGroup">
                <div className="catalogFiltersPills">
                    {SURFACE_OPTIONS.map((surface) => (
                        <button
                            key={surface.key}
                            type="button"
                            className={`catalogFiltersPill ${activeSurface === surface.key ? "isActive" : ""}`}
                            onClick={() => onSurfaceChange(surface.key)}
                        >
                            {surface.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
