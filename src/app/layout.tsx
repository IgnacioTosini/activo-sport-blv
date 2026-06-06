import type { Metadata } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import CursorGlow from "@/components/ui/cursorGlow/CursorGlow";
import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer/Footer";
import { ToastContainer } from "react-toastify";
import { isAdminAuthenticated } from "@/lib/admin-session";
import 'react-toastify/dist/ReactToastify.css';
import "./globals.scss";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  style: "normal",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  style: "normal",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_BASE_URL}`),

  title: {
    default: "Activo Sport BLV",
    template: "%s | Activo Sport BLV",
  },

  description:
    "Tienda especializada en botines de fútbol. Encontrá modelos Nike, Adidas, Puma, Joma y más. Envíos a todo el país.",

  keywords: [
    "botines",
    "botines futbol",
    "botines nike",
    "botines adidas",
    "botines puma",
    "botines joma",
    "futbol",
    "tienda deportiva",
    "activo sport blv",
  ],

  authors: [
    {
      name: "Activo Sport BLV",
    },
  ],

  creator: "Activo Sport BLV",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "Activo Sport BLV",
    description:
      "Botines de fútbol de las mejores marcas. Encontrá el modelo ideal para tu juego.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
    siteName: "Activo Sport BLV",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Activo Sport BLV",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Activo Sport BLV",
    description:
      "Botines de fútbol de las mejores marcas.",
    images: ["/logo.jpg"],
  },

  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}`,
  },

  icons: {
    icon: "/logo.webp",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdmin = await isAdminAuthenticated();
  return (
    <html lang="es" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body>
        <CursorGlow />
        <Navbar isAdmin={isAdmin} />
        {children}
        <Footer />
        <ToastContainer position="bottom-center" autoClose={3500} />
      </body>
      <Analytics />
    </html>
  );
}
