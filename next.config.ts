import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "canvas", "tesseract.js"],
  outputFileTracingIncludes: {
    "/**/*": ["./node_modules/tesseract.js/**/*"],
  },
};

export default nextConfig;
