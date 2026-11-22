import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MAKELSAN Маркет — источники бесперебойного питания",
    short_name: "MAKELSAN Маркет",
    description:
      "Интернет-магазин ИБП Makelsan: каталог, цены в рублях, склад в Москве, доставка по России.",
    lang: "ru",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0e14",
    theme_color: "#0a0e14",
    icons: [
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/icon.svg", type: "image/svg+xml" },
    ],
  };
}
