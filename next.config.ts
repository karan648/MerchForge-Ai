import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.16"],
  experimental: {
    serverActions: {
      // Banner uploads are sent as data URLs in server actions.
      // 5 MB binary files can exceed 6.5 MB after base64 encoding.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
