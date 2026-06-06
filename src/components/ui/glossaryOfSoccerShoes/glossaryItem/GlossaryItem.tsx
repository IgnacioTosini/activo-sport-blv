import './_glossaryItem.scss';

interface Props {
    label: string;
    meaning: string;
    description: string;
}

export const GlossaryItem = ({ label, meaning, description }: Props) => {
    return (
        <div className="glossaryItem">
            <h2 className='glossaryItemLabel'>{label}</h2>
            <p className='glossaryItemMeaning'>{meaning}</p>
            <p className='glossaryItemDescription'>{description}</p>
        </div>
    )
}
