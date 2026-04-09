import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Provide a dummy DATABASE_URL at build time so neon() module-level
  // initialization doesn't fail during static analysis. The real value
  // is set via environment variables at runtime.
  env: {
    DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://build-placeholder:build-placeholder@localhost/build-placeholder",
  },
};

export default nextConfig;
