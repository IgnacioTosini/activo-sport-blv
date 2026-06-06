import { surfaceItems } from '@/utils/glossary'
import { GlossaryItem } from '@/components/ui/glossaryOfSoccerShoes/glossaryItem/GlossaryItem'
import { Title } from '@/components/ui/Title/Title'
import './_glossaryOfSoccerShoes.scss'

export const GlossaryOfSoccerShoes = () => {
    return (
        <div className="glossaryOfSoccerShoes" id="dictionary">
            <div className="glossaryOfSoccerShoesContainer">
                <Title text="Diccionario del botín" subTitle='SABÉ LO QUE CALZÁS' />
                <div className="glossaryOfSoccerShoesItems">
                    {
                        surfaceItems && Object.values(surfaceItems).map((item) => (
                            <GlossaryItem key={item.label} {...item} />
                        ))
                    }
                </div>
            </div>
        </div>
    )
}
