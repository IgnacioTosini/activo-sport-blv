import { ProductWithRelations } from '@/actions/utils/productActions.utils';
import { ProductGallery } from './ProductGallery/ProductGallery';
import { ProductOverview } from './ProductOverview/ProductOverview';
import { ProductSpecs } from './ProductSpecs/ProductSpecs';
import { ProductPurchasePanel } from './ProductPurchasePanel/ProductPurchasePanel';
import { cloudinaryImage } from '@/helpers/cloudinary';
import './_productCard.scss';

interface Props {
    product: ProductWithRelations;
}

export const ProductCard = ({ product }: Props) => {
    return (
        <div className="productCard">
            <ProductGallery
                name={product.name}
                mainImage={product.mainImage}
                galleryImages={product.images.map((image: { url: string }) => cloudinaryImage(image.url))}
            />

            <div className="productCardInfo">
                <ProductOverview
                    brandName={product.brand.name}
                    name={product.name}
                    price={product.price}
                    description={product.description}
                />
                <ProductSpecs surfaceType={product.surfaceType} />
                <ProductPurchasePanel
                    productId={product.id}
                    productName={product.name}
                    productBrand={product.brand.name}
                    productPrice={product.price}
                    productImage={product.mainImage}
                    stock={product.stock}
                />
            </div>
        </div>
    )
}
