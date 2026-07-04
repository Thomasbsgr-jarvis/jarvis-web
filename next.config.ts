import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  poweredByHeader: false,
  allowedDevOrigins: ["next.thomasbsgr.dev"],
};

export default nextConfig;
