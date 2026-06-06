"use client";

import { useMemo, useState } from "react";
import { ProductStockItem } from "../productCard.types";
import { ProductActions } from "../ProductActions/ProductActions";
import { ProductSizes } from "../ProductSizes/ProductSizes";

type Props = {
  productId: string;
  slug: string;
  productName: string;
  productBrand: string;
  productPrice: number;
  productImage: string;
  stock: ProductStockItem[];
};

export const ProductPurchasePanel = ({
  productId,
  slug,
  productName,
  productBrand,
  productPrice,
  productImage,
  stock,
}: Props) => {
  const availableStock = useMemo(
    () => stock.filter((item) => item.quantity > 0).sort((a, b) => a.size.usSize - b.size.usSize),
    [stock]
  );

  const [internalSelectedStockId, setInternalSelectedStockId] = useState("");

  const selectedStockId = useMemo(() => {
    if (availableStock.length === 0) {
      return "";
    }

    const currentStillExists = availableStock.some((item) => item.id === internalSelectedStockId);
    return currentStillExists ? internalSelectedStockId : availableStock[0].id;
  }, [availableStock, internalSelectedStockId]);

  const selectedStock = availableStock.find((item) => item.id === selectedStockId) ?? null;

  return (
    <>
      <ProductSizes
        stock={stock}
        selectedSizeId={selectedStockId}
        onSelectSizeId={setInternalSelectedStockId}
      />
      <ProductActions
        productId={productId}
        slug={slug}
        productName={productName}
        productBrand={productBrand}
        productPrice={productPrice}
        productImage={productImage}
        selectedSizeId={selectedStock?.size.id ?? ""}
        selectedSizeLabel={selectedStock ? `${selectedStock.size.eurSize} EU` : ""}
        canAddToCart={Boolean(selectedStock)}
      />
    </>
  );
};
