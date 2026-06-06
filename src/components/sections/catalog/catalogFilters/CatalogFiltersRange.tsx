type Props = {
  priceLimit: number;
  maxAvailablePrice: number;
  formattedPriceLimit: string;
  hasProducts: boolean;
  onPriceLimitChange: (value: number) => void;
};

export const CatalogFiltersRange = ({
  priceLimit,
  maxAvailablePrice,
  formattedPriceLimit,
  hasProducts,
  onPriceLimitChange,
}: Props) => {
  return (
    <div className="catalogFiltersRangeRow">
      <label htmlFor="catalogPriceRange" className="catalogFiltersRangeLabel">
        HASTA ${formattedPriceLimit}
      </label>

      <input
        id="catalogPriceRange"
        type="range"
        min={0}
        max={maxAvailablePrice || 0}
        step={1000}
        value={priceLimit}
        onChange={(event) => onPriceLimitChange(Number(event.target.value))}
        disabled={!hasProducts}
      />
    </div>
  );
};
