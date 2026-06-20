import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Bebas_Neue } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/ToastProvider";
import { QueryProvider } from "@/components/QueryProvider";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Saint Ferdinand FC | Club de Fútbol",
  description: "Club de Fútbol · USS Liga Premier · Madrid · Plantilla, partidos, estadísticas y galería",
  openGraph: {
    title: "Saint Ferdinand FC",
    description: "Club de Fútbol · USS Liga Premier · Madrid",
    siteName: "Saint Ferdinand FC",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${bebasNeue.variable}`}>
      <body className="min-h-full overflow-x-hidden bg-white font-sans antialiased">
        <QueryProvider>
        <ToastProvider>
          <SmoothScroll>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </SmoothScroll>
        </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}