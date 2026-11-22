import type { Metadata } from "next";
import { Manrope, Oswald } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompareBar from "@/components/CompareBar";
import RevealProvider from "@/components/RevealProvider";
import JsonLd from "@/components/JsonLd";
import { organizationLd, SITE_URL, SITE_TITLE } from "@/lib/seo";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});

const oswald = Oswald({
  subsets: ["latin", "cyrillic"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_TITLE} | Интернет-магазин`,
    template: "%s — MAKELSAN Маркет",
  },
  description:
    "Интернет-магазин источников бесперебойного питания Makelsan: серии Boxer, LevelUPS, PowerPack SE, LION Plus и другие. On-line ИБП от 10 кВА до 1 МВА. Продажа B2C и B2B, склад в Москве, доставка по России.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "MAKELSAN Маркет",
    title: "Makelsan — источники бесперебойного питания",
    description:
      "Каталог on-line ИБП Makelsan от 10 кВА до 1 МВА. Склад в Москве, доставка по России, B2B и B2C.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Makelsan — источники бесперебойного питания",
    description:
      "Каталог on-line ИБП Makelsan от 10 кВА до 1 МВА. Склад в Москве, доставка по России.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /* suppressHydrationWarning: инлайновый скрипт добавляет класс js на <html> до гидратации */
    <html lang="ru" className={`${manrope.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        {/* Класс js включает scroll-reveal скрытие (см. globals.css): без JS контент виден полностью */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');" }} />
        <JsonLd data={organizationLd()} />
        <Header />
        <main className="flex-1">{children}</main>
        <CompareBar />
        <Footer />
        <RevealProvider />
      </body>
    </html>
  );
}
