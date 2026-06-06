import type { ProductWithRelations } from "@/actions/utils/productActions.utils";

export type ProductCardData = ProductWithRelations;
export type ProductStockItem = ProductWithRelations["stock"][number];
