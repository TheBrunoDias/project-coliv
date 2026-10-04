import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Google account profile photos
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")],
  },
};

export default withSerwist(nextConfig);
