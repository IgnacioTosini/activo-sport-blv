import "./_productSpecs.scss";

type Props = {
    surfaceType: string;
};

export const ProductSpecs = ({ surfaceType }: Props) => {
    return (
        <div className="productSpecs">
            <article className="productSpecCard">
                <span className="productSpecLabel">SUELA</span>
                <strong className="productSpecValue">{surfaceType}</strong>
            </article>
        </div>
    );
};
