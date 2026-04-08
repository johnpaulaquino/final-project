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
  // FIX: rewrites must be an async function that returns the array
  async rewrites() {
    return [
      {
        // Whenever the frontend asks for /api/v1/biskota/...
        source: "/api/v1/biskota/:path*",
        // Secretly forward it to FastAPI on port 9898
        destination: "http://localhost:9898/api/v1/biskota/:path*",
      },
      {
        // For the auth/refresh routes
        source: "/api/v1/auth/:path*",
        destination: "http://localhost:9898/api/v1/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
