"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import "./_productGallery.scss";

type Props = {
    name: string;
    mainImage: string;
    galleryImages: string[];
};

export const ProductGallery = ({ name, mainImage, galleryImages }: Props) => {
    const images = useMemo(() => {
        const merged = [mainImage, ...galleryImages];
        return Array.from(new Set(merged.filter(Boolean)));
    }, [mainImage, galleryImages]);

    const [activeImage, setActiveImage] = useState(images[0] ?? mainImage);

    return (
        <div className="productGallery">
            <div className="productGalleryMain">
                <Image src={activeImage} alt={name} className="productGalleryMainImage" width={760} height={760} priority />
            </div>

            <div className="productGalleryThumbs">
                {images.map((imageUrl, index) => {
                    const isActive = imageUrl === activeImage;

                    return (
                        <button
                            key={`${imageUrl}-${index}`}
                            type="button"
                            className={`productGalleryThumb ${isActive ? "isActive" : ""}`}
                            onClick={() => setActiveImage(imageUrl)}
                            aria-label={`Ver imagen ${index + 1} de ${name}`}
                        >
                            <Image
                                src={imageUrl}
                                alt={`${name} miniatura ${index + 1}`}
                                className="productGalleryThumbImage"
                                width={120}
                                height={120}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
