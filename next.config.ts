import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "base.sstmk.ru",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
