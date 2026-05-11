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
  reactStrictMode: false,

  async rewrites() {
    console.log(
      "Setting up rewrites to backend API...",
      process.env.BACKEND_INTERNAL_URL,
    );
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${process.env.BACKEND_INTERNAL_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
