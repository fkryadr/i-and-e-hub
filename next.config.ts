import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Unsplash (existing)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Thirdweb IPFS gateway (primary)
      {
        protocol: "https",
        hostname: "*.ipfs.dweb.link",
        pathname: "/**",
      },
      // Cloudflare IPFS gateway
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
        pathname: "/ipfs/**",
      },
      // Public IPFS.io gateway
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**",
      },
      // Pinata dedicated gateway
      {
        protocol: "https",
        hostname: "*.mypinata.cloud",
        pathname: "/ipfs/**",
      },
      // Thirdweb storage CDN (ipfs.thirdwebcdn.com)
      {
        protocol: "https",
        hostname: "ipfs.thirdwebcdn.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
