import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Provide a dummy DATABASE_URL at build time so neon() module-level
  // initialization doesn't fail during static analysis. The real value
  // is set via environment variables at runtime.
  env: {
    DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://build-placeholder:build-placeholder@localhost/build-placeholder",
  },
  // PDFKit requires Node.js native modules (font handling, streams) that cannot
  // be bundled by webpack. Marking it as external ensures Vercel serverless
  // functions load it as a regular Node.js require().
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
