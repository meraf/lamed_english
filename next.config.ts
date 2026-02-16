import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // '/**' allows any image path from your Cloudinary account
        pathname: '/**', 
      },
    ],
  },
};

export default nextConfig;