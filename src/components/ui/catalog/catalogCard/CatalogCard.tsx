import Link from 'next/link';
import { SurfaceType } from '@prisma/client';
import Image from 'next/image';
import { HiSparkles } from 'react-icons/hi2';
import { RiFireLine } from 'react-icons/ri';
import './_catalogCard.scss';

export type CatalogCardProduct = {
    id: string;
    slug: string;
    name: string;
    price: number;
    mainImage: string;
    featured: boolean;
    isNew: boolean;
    surfaceType: SurfaceType;
    brand?: { name: string } | null;
    stock?: Array<{
        quantity: number;
        size?: { usSize: number; eurSize: number; cmSize: number } | null;
    }>;
};

interface Props {
    product: CatalogCardProduct;
}

export const CatalogCard = ({ product }: Props) => {
    const stockRows = (product.stock ?? []).filter((row) => row.quantity > 0);
    const totalStock = stockRows.reduce((acc, row) => acc + row.quantity, 0);

    const formattedPrice = new Intl.NumberFormat('es-AR').format(Math.round(product.price));

    return (
        <Link href={`/producto/${product.slug}`} key={product.id} className="catalogCard">
            <div className="catalogCardTopRow">
                <div className="catalogCardBadges">
                    {product.isNew ? (
                        <span className="catalogCardBadge isNew">
                            <HiSparkles className="catalogCardBadgeIcon" aria-hidden="true" />
                            Nuevo
                        </span>
                    ) : null}
                    {product.featured ? (
                        <span className="catalogCardBadge">
                            <RiFireLine className="catalogCardBadgeIcon" aria-hidden="true" />
                            Destacado
                        </span>
                    ) : null}
                </div>

                {/* <button type="button" className="catalogCardFav" aria-label="Agregar a favoritos">
                    <HiOutlineHeart className="catalogCardFavIcon" aria-hidden="true" />
                </button> */}
            </div>

            <div className="catalogCardImageContainer">
                <Image
                    src={product.mainImage}
                    alt={product.name}
                    className="catalogCardImage"
                    width={540}
                    height={320}
                    unoptimized
                />
            </div>

            <div className="catalogCardInfo">
                <p className="catalogCardMeta">
                    {(product.brand?.name ?? 'Marca').toUpperCase()} · {product.surfaceType}
                </p>
                <h3 className="catalogCardName">{product.name}</h3>
                <p className="catalogCardPrice">$ {formattedPrice}</p>
            </div>

            <div className="catalogCardStockPanel">
                <div className="catalogCardStockHeader">
                    <span>Talles</span>
                    <strong>{totalStock} U.</strong>
                </div>

                <div className="catalogCardStockTags">
                    {stockRows.length > 0 ? (
                        stockRows.map((row, index) => {
                            const size = row.size;
                            return (
                                <span key={`${size?.cmSize}-${index}`} className="catalogCardStockTag">
                                    {size?.cmSize}
                                </span>
                            );
                        })
                    ) : (
                        <span className="catalogCardStockEmpty">Sin stock disponible</span>
                    )}
                </div>
            </div>
        </Link>
    );
};
