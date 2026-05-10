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

  // async rewrites() {
  //   return [
  //     {
  //       source: "/api-proxy/:path*",
  //       destination: `${process.env.BACKEND_INTERNAL_URL}/:path*`,
  //     },
  //   ];
  // },
};

export default nextConfig;
