import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["tesseract.js"],
  },
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/tesseract.js/**/*"],
  },
};

export default nextConfig;
