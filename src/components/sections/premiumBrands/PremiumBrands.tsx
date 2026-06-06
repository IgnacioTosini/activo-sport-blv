import { Title } from '@/components/ui/Title/Title'
import { Brand } from '@prisma/client'
import Link from 'next/link';
import './_premiumBrands.scss'

interface Props {
    brands: Brand[];
}

export const PremiumBrands = ({ brands }: Props) => {
    return (
        <div className='premiumBrands' id='brands'>
            <div className='premiumBrandsContainer'>
                <div className="catalogHeader">
                    <Title text={'Marcas premium'} subTitle='JUGÁ CON LAS MEJORES' />
                    <Link href="/catalogo" className="catalogLink">
                        Ver todas
                    </Link>
                </div>
                <div className='premiumBrandsList'>
                    {brands.map((brand) => (
                        <Link
                            key={brand.id}
                            href={{
                                pathname: '/catalogo',
                                query: { brand: brand.name },
                            }}
                            className='premiumBrandItem'
                        >
                            <h3 className="premiumBrandName">{brand.name}</h3>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
