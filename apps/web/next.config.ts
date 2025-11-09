import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all HTTPS hostnames
      },
      {
        protocol: "http",
        hostname: "**", // Allow all HTTP hostnames
      },
    ],
  },
};

export default nextConfig;
