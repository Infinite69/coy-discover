import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd(), ".."),
  async rewrites() {
    // In production the browser calls the deployed Express API directly via
    // NEXT_PUBLIC_API_URL. Keep this proxy only for local development.
    if (process.env.NEXT_PUBLIC_API_URL) return [];
    return [{ source: "/api/:path*", destination: "http://localhost:4000/:path*" }];
  },
};

export default nextConfig;
