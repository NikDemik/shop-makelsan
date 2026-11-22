/**
 * Общие SEO-константы и хелперы (canonical, JSON-LD).
 * Базовый адрес сайта берётся из NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const SITE_NAME = "MAKELSAN Маркет";
export const SITE_TITLE = "Makelsan — источники бесперебойного питания";
export const SITE_EMAIL = "sales@makelsan-ups.ru";
export const SITE_PHONE = "+7 800 505-10-10";
export const SITE_PHONE_HREF = "tel:+78005051010";
export const SITE_ADDRESS = "Москва, ул. Электрозаводская, д. 21, стр. 4";

/** Базовый адрес площадки-источника (изображения и файлы товаров) */
export const BASE_HOST = "https://base.sstmk.ru";

/** Абсолютная ссылка на изображение/файл из API (путь относительно корня base.sstmk.ru) */
export function baseAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const p = path.trim();
  if (!p) return null;
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return `${BASE_HOST}${p.startsWith("/") ? "" : "/"}${p}`;
}

export function absUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/** JSON-LD хлебных крошек: [{ name: "Главная", url: "/" }, ...] */
export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absUrl(item.url),
    })),
  };
}

/** JSON-LD Organization + LocalBusiness */
export function organizationLd() {
  const address = {
    "@type": "PostalAddress",
    addressCountry: "RU",
    addressLocality: "Москва",
    streetAddress: "ул. Электрозаводская, д. 21, стр. 4",
  };
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: absUrl("/icon.svg"),
      email: SITE_EMAIL,
      telephone: SITE_PHONE,
      address,
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: `${SITE_NAME} — склад и шоурум`,
      url: SITE_URL,
      image: absUrl("/icon.svg"),
      email: SITE_EMAIL,
      telephone: SITE_PHONE,
      address,
      priceRange: "₽₽",
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00",
        },
      ],
    },
  ];
}
