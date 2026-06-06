import { CiHeart, CiSearch, CiShoppingCart, CiUser } from "react-icons/ci";

type NavigationItem = {
    id: string;
    label: string;
    href: string;
    sectionId?: string;
};

export const navigationItems: readonly NavigationItem[] = [
    { id: 'catalog', label: 'Catálogo', href: '/catalogo' },
    { id: 'brands', label: 'Marcas', href: '/#brands', sectionId: 'brands' },
    { id: 'dictionary', label: 'Diccionario', href: '/#dictionary', sectionId: 'dictionary' },
    { id: 'about', label: 'Sobre', href: '/#about', sectionId: 'about' },
];

export const navigationIcons = [
    {
        id: "search",
        icon: CiSearch,
        href: "/catalogo",
    },
    /* {
        id: "favorites",
        icon: CiHeart,
        href: "/favorites",
    }, */
    {
        id: "cart",
        icon: CiShoppingCart,
        href: "/cart",
    },
    /* {
        id: "profile",
        icon: CiUser,
        href: "/profile",
    }, */
];