'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MouseEvent, useEffect, useRef, useState } from "react";
import gsap from 'gsap';
import { RxHamburgerMenu } from "react-icons/rx";
/* import { animateNavbarEntrance } from '@/components/animations/gsap/navbarAnimations'; */
import { HamburgerNavbar } from "../HamburgerNavbar/HamburgerNavbar";
import { IoMdClose } from "react-icons/io";
import { navigationItems, navigationIcons } from "@/utils/navigationItems";
import { handleBrandNavigation, handleSectionNavigation, observeActiveSection, syncHashSectionOnRouteChange } from "@/utils/navigationHelpers";
import { useCartStore } from "@/store/cart.store";
import { FaUserSecret } from "react-icons/fa";
import "./_navbar.scss";

interface Props {
    isAdmin: boolean;
}

export default function Navbar({ isAdmin }: Props) {
    const pathname = usePathname()
    const navbarRef = useRef<HTMLElement>(null)
    const iconRef = useRef<HTMLSpanElement>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [activeSection, setActiveSection] = useState<string>('')
    const currentSection = pathname === '/' ? activeSection : '';
    const totalItems = useCartStore((state) => state.totalItems);

    useEffect(() => {
        if (!navbarRef.current) return;
        const ctx = gsap.context(() => {
            /* animateNavbarEntrance(navbarRef.current!); */
        }, navbarRef.current);
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (!iconRef.current) return;
        gsap.to(iconRef.current, {
            rotate: isMenuOpen ? 90 : 0,
            duration: 0.24,
            ease: 'power2.inOut',
        });
    }, [isMenuOpen]);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768
            setIsMobile(mobile)
            if (!mobile) setIsMenuOpen(false)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const closeMobileMenu = () => {
        if (isMobile) setIsMenuOpen(false)
    }

    const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
        handleBrandNavigation({
            event,
            pathname,
            onBeforeNavigate: closeMobileMenu,
        })
    }

    const handleSectionNavigationClick = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        handleSectionNavigation({
            event,
            pathname,
            sectionId,
            onBeforeNavigate: closeMobileMenu,
        })
    }

    useEffect(() => {
        syncHashSectionOnRouteChange()
    }, [pathname])

    useEffect(() => {
        if (pathname !== '/') return

        return observeActiveSection(setActiveSection)
    }, [pathname])

    return (
        <nav ref={navbarRef} className="navbar">
            <Link href="/" className="navbarBrand" onClick={handleBrandClick}>Activo <span>Sport BLV</span></Link>
            {isMobile ? (
                <>
                    <button
                        type="button"
                        className="hamburgerButton"
                        aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-navigation"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                    >
                        <span ref={iconRef}>
                            {isMenuOpen ? <IoMdClose size={26} /> : <RxHamburgerMenu size={26} />}
                        </span>
                    </button>

                    <HamburgerNavbar
                        id="mobile-navigation"
                        isOpen={isMenuOpen}
                        onSectionClick={handleSectionNavigationClick}
                        activeSection={currentSection}
                    />
                </>
            ) : (
                <>
                    <div className="navbarLinks">
                        {navigationItems.map(({ id, label, href, sectionId }) => (
                            <Link
                                key={id}
                                href={href}
                                className={`navbarLink ${sectionId && currentSection === sectionId ? 'active' : ''}`}
                                aria-current={sectionId && currentSection === sectionId ? 'page' : undefined}
                                onClick={(event) => {
                                    if (sectionId) {
                                        handleSectionNavigationClick(event, sectionId)
                                        return
                                    }

                                    closeMobileMenu()
                                }}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </>
            )}
            <div className="navbarIcons">
                {
                    navigationIcons.map(({ id, icon: Icon, href }) => (
                        <Link
                            key={id}
                            href={href}
                            className={`navbarIcon ${currentSection === id ? 'active' : ''}`}
                            aria-current={currentSection === id ? 'page' : undefined}
                            onClick={() => {
                                closeMobileMenu()
                            }}
                        >
                            <Icon />
                            {id === 'cart' && totalItems > 0 && <span className="cartBadge">{totalItems}</span>}
                        </Link>
                    ))
                }
                    {isAdmin && (
                        <Link href="/admin" className={`navbarIcon ${pathname === '/admin' ? 'active' : ''}`} aria-current={pathname === '/admin' ? 'page' : undefined}>
                            <span className="adminIcon"><FaUserSecret /></span>
                        </Link>
                    )}
            </div>
        </nav>
    )
}
