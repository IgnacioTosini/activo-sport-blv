"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
/* import { animateFooter } from '@/components/animations/gsap/footerAnimations'; */
import { IoLogoInstagram, IoLogoWhatsapp } from 'react-icons/io';
import { navigationItems } from '@/utils/navigationItems';
import { handleSectionNavigation } from '@/utils/navigationHelpers';
import './_footer.scss';

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      /* animateFooter(footerRef.current!); */
    }, footerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="footer">
      <div className='footerContent'>
        <div className='footerContentHeader'>
          <h1>ACTIVO <span>BLV</span></h1>
          <p className='footerContentHeaderDescription'>Tu próximo par de botines. Catálogo curado, marcas premium, asesoramiento real. Hecho por futboleros, para futboleros.</p>
          <div className='footerContentHeaderSocialMedia'>
            <Link href='https://www.instagram.com/activoblv/' target='_blank' rel='noopener noreferrer'>
              <IoLogoInstagram size={24} />
            </Link>
            <Link href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} target='_blank' rel='noopener noreferrer'>
              <IoLogoWhatsapp size={24} />
            </Link>
          </div>
        </div>
        <ul className='footerContentNavigation'>
          <h2>Tienda</h2>
          {
            navigationItems.map(item => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={(event) => {
                    if (!item.sectionId) return;

                    handleSectionNavigation({
                      event,
                      pathname,
                      sectionId: item.sectionId,
                    });
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))
          }
        </ul>
      </div>
        <div className='footerContentFooter'>
          <div className='footerContentInfo'>
            <h4>© {new Date().getFullYear()} ACTIVO BLV. Todos los derechos reservados.</h4>
            <p className='footerContentPayment'>Pagamos con Mercado Pago • Transferencia • Efectivo</p>
          </div>
          <p>Diseñado por Ignacio Tosini</p>
        </div>
    </footer>
  )
}
