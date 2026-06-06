import { cloudinaryImage } from "../cloudinary";

type ProductWithImages = {
    mainImage: string;
    images?: {
        url: string;
    }[];
};

export function mapProductImages<T extends ProductWithImages>(
    product: T
): T {
    return {
        ...product,
        mainImage: cloudinaryImage(product.mainImage),
        images: product.images?.map((image) => ({
            ...image,
            url: cloudinaryImage(image.url),
        })),
    };
}

export function mapProductsImages<T extends ProductWithImages>(
    products: T[]
): T[] {
    return products.map(mapProductImages);
}