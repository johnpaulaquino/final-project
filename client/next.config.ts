import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**", // This allows any image path from your Cloudinary account
      },
    ],
  },
  reactStrictMode: false, // Turn this to false
  // ADD THIS BLOCK
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",

        destination: "https://biskota-api.up.railway.app/:path*",
      },
    ];
  },
};

export default nextConfig;
