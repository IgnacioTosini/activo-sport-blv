import "./_productOverview.scss";

type Props = {
    brandName: string;
    name: string;
    price: number;
    description: string;
};

export const ProductOverview = ({ brandName, name, price, description }: Props) => {
    const formattedPrice = new Intl.NumberFormat("es-AR").format(Math.round(price));

    return (
        <div className="productOverview">
            <p className="productOverviewBrand">{brandName.toUpperCase()}</p>
            <h1 className="productOverviewName">{name}</h1>

            <div className="productOverviewPriceRow">
                <p className="productOverviewPrice">$ {formattedPrice}</p>
                <span className="productOverviewInstallments">HASTA 6 CUOTAS SIN INTERÉS</span>
            </div>

            <p className="productOverviewDescription">{description}</p>
        </div>
    );
};
