import { Title } from '@/components/ui/Title/Title';
import Image from 'next/image';
import './_about.scss';

export const About = () => {
    return (
        <div className="aboutSection" id="about">
            <div className="aboutContainer">
                    <Title text={"Sobre nosotros"} subTitle="FÚTBOL ES IDENTIDAD" />
                <div className="aboutContent">
                    <div className="aboutTextContainer">
                    <p className='aboutText'>Activo Sport BLV nació en el barrio, mirando jugar. Nos cansamos de los locales que te venden cualquier cosa, así que armamos un catálogo curado con los modelos que de verdad valen la pena.</p>
                    <p className='aboutText'>Trabajamos con Nike, Adidas, Puma, Mizuno y New Balance. Sólo botines premium, originales, con asesoramiento de gente que vive el fútbol todos los días.</p>
                    <p className='aboutText'>Si no sabés qué comprar, te ayudamos. Si querés algo específico, lo conseguimos. Acá no hay vendedor: hay un compañero de equipo.</p>
                    </div>
                <Image src="/hero/hero3.jpg" alt="Sobre nosotros" className="aboutImage" width={500} height={500} />
                </div>
            </div>
        </div>
    )
}
