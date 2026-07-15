import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["tesseract.js", "sharp"],

  // Optional: Increase body size limit for file uploads
  experimental: {
    // You can add other experimental flags here if needed
  },

  // This helps with large file uploads in App Router
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
};

export default nextConfig;

// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   experimental: {
//     serverComponentsExternalPackages: ["sharp", "tesseract.js"],
//   },

//   outputFileTracingIncludes: {
//     "/api/**/*": [
//       "./node_modules/tesseract.js/**/*",
//       "./node_modules/sharp/**/*",
//       "./node_modules/@img/sharp-libvips/**/*",
//     ],
//   },
// };

// export default nextConfig;
