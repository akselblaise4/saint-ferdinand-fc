import type { Metadata } from "next";
import { Archivo_Narrow, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const archivoNarrow = Archivo_Narrow({
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
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
    <html lang="es" className={`${archivoNarrow.variable} ${inter.variable}`}>
      <body className="min-h-full overflow-x-hidden bg-background font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
