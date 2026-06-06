"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductStockItem } from "../productCard.types";
import { SizeModal } from "@/components/ui/sizeModal/SizeModal";
import "./_productSizes.scss";

type Props = {
    stock: ProductStockItem[];
    selectedSizeId?: string;
    onSelectSizeId?: (stockId: string) => void;
};

function formatSize(value: number) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export const ProductSizes = ({ stock, selectedSizeId, onSelectSizeId }: Props) => {
    const MODAL_ANIMATION_DURATION = 220;

    const availableStock = useMemo(() => {
        return stock
            .filter((item) => item.quantity > 0)
            .sort((a, b) => a.size.usSize - b.size.usSize);
    }, [stock]);

    const [internalSelectedSizeId, setInternalSelectedSizeId] = useState(availableStock[0]?.id ?? "");
    const resolvedSelectedSizeId = selectedSizeId ?? internalSelectedSizeId;
    const [isSizeModalMounted, setIsSizeModalMounted] = useState(false);
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

    const openSizeModal = () => {
        setIsSizeModalMounted(true);
        setIsSizeModalOpen(true);
    };

    const closeSizeModal = () => {
        setIsSizeModalOpen(false);
    };

    useEffect(() => {
        if (!isSizeModalMounted || isSizeModalOpen) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setIsSizeModalMounted(false);
        }, MODAL_ANIMATION_DURATION);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [isSizeModalMounted, isSizeModalOpen]);

    return (
        <div className="productSizes">
            <div className="productSizesHeader">
                <span className="productSizesTitle">TALLE</span>
                <button type="button" className="productSizesGuideButton" onClick={openSizeModal}>GUÍA DE TALLES</button>
            </div>

            <div className="productSizesList">
                {availableStock.length > 0 ? (
                    availableStock.map((item) => {
                                const isActive = item.id === resolvedSelectedSizeId;
                        const sizeLabel = formatSize(item.size.eurSize);

                        return (
                            <button
                                key={item.id}
                                type="button"
                                className={`productSizeButton ${isActive ? "isActive" : ""}`}
                                onClick={() => {
                                    if (onSelectSizeId) {
                                        onSelectSizeId(item.id);
                                        return;
                                    }

                                    setInternalSelectedSizeId(item.id);
                                }}
                            >
                                {sizeLabel}
                            </button>
                        );
                    })
                ) : (
                    <p className="productSizesEmpty">Sin stock disponible</p>
                )}
            </div>
            {isSizeModalMounted && <SizeModal onClose={closeSizeModal} isOpen={isSizeModalOpen} />}
        </div>
    );
};
