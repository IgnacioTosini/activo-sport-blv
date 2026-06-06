import { Title } from '@/components/ui/Title/Title';
import Link from 'next/link';
import { CatalogCardProduct } from '@/components/ui/catalog/catalogCard/CatalogCard';
import { CatalogGrid } from '@/components/ui/catalogGrid/CatalogGrid';
import './_catalog.scss';

interface Props {
    products: CatalogCardProduct[];
}

export const Catalog = ({ products }: Props) => {
    return (
        <div className="catalog">
            <div className="catalogContent">
                <div className="catalogHeader">
                    <Title text={'Catálogo destacado'} subTitle='LOS BOTINES DEL MES' />
                    <Link href="/catalogo" className="catalogLink">
                        Ver Catálogo Completo
                    </Link>
                </div>
                <CatalogGrid products={products} />
            </div>
        </div>
    )
}
