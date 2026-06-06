import { Brand } from '@prisma/client'
import './_brandsBanner.scss'

interface Props {
  brands: Brand[];
}

export const BrandsBanner = ({ brands }: Props) => {
  const marqueeBrands = brands.length > 0 ? [...brands, ...brands] : [];

  return (
    <section className="brandsBanner" aria-label="Marcas destacadas">
      {marqueeBrands.length > 0 ? (
        <div className="brandsBannerViewport">
          <div className="brandsBannerTrack">
            {marqueeBrands.map((brand, index) => (
              <p
                key={`${brand.id}-${index}`}
                className="brandsBannerItem"
                aria-hidden={index >= brands.length}
              >
                {brand.name}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <p className="brandsBannerEmpty">No brands available</p>
      )}
    </section>
  )
}
