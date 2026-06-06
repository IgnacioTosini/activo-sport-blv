import { CatalogCard, CatalogCardProduct } from '../catalog/catalogCard/CatalogCard';
import './_catalogGrid.scss';

interface Props {
    products: CatalogCardProduct[];
}

export const CatalogGrid = ({ products }: Props) => {
    return (
        <div className="catalogGrid">
            {
                products.length > 0 ? (
                    <div className="catalogGrid">
                        {products.map((product) => (
                            <CatalogCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <p className="catalogEmpty">No hay productos destacados en este momento.</p>
                )
            }
        </div>
    )
}
