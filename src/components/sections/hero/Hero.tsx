'use client';

import type { CSSProperties } from 'react';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './_hero.scss';

const heroSlides = [
    {
        image: '/hero/hero1.jpg',
        description: 'Nike Mercurial - Velocidad explosiva para romper cada linea.',
    },
    {
        image: '/hero/hero2.jpg',
        description: 'Adidas Predator - Diseñados para los que viven el futbol.',
    },
    {
        image: '/hero/hero3.jpg',
        description: 'Puma Future - Ajuste preciso para dominar cada cambio de ritmo.',
    },
] as const;

export const Hero = () => {
    const [activeSlide, setActiveSlide] = useState(1);
    const autoplayRef = useRef<NodeJS.Timeout | null>(null);
    const userInteractedRef = useRef(false);

    // Cambia de slide automáticamente cada 4s, pausa si el usuario interactúa
    useEffect(() => {
        if (userInteractedRef.current) return;
        autoplayRef.current = setTimeout(() => {
            setActiveSlide((prev) => (prev + 1) % heroSlides.length);
        }, 4000);
        return () => {
            if (autoplayRef.current) clearTimeout(autoplayRef.current);
        };
    }, [activeSlide]);

    const goToSlide = (index: number) => {
        setActiveSlide(index);
        userInteractedRef.current = true;
        if (autoplayRef.current) clearTimeout(autoplayRef.current);
        // Reactiva autoplay después de 10s sin interacción
        setTimeout(() => {
            userInteractedRef.current = false;
        }, 10000);
    };

    const currentSlide = heroSlides[activeSlide];
    const heroStyle = {
        '--hero-image': `url(${currentSlide.image})`,
    } as CSSProperties;

    return (
        <section className="hero" style={heroStyle}>
            <div className="heroInner">
                <div className="heroContent">
                    <span className="heroLabel">
                        <span className="heroLabelLine" />
                        Activo Sport BLV
                    </span>
                    <h1 className="heroTitle">
                        <span>TU PRÓXIMO</span>
                        <span>PAR DE</span>
                        <span><b>BOTINES</b> ESTÁ</span>
                        <span>ACÁ</span>
                    </h1>
                    <p className="heroDescription">{currentSlide.description}</p>
                    <div className="heroButtons">
                        <Link href="/catalogo" className="primaryButton">Ver Catálogo</Link>
                        <Link href="/#brands" className="secondaryButton">Elegí tu botín</Link>
                    </div>
                    <div className="heroPagination" aria-label="Slides del hero">
                        <div className="heroPaginationBars">
                            {heroSlides.map((slide, index) => (
                                <button
                                    key={slide.image}
                                    type="button"
                                    className={`heroPaginationBar ${index === activeSlide ? 'isActive' : ''}`}
                                    aria-label={`Mostrar slide ${index + 1}`}
                                    aria-pressed={index === activeSlide}
                                    onClick={() => goToSlide(index)}
                                />
                            ))}
                        </div>
                        <span className="heroPaginationCounter">
                            {String(activeSlide + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};
