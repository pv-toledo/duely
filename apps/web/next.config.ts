import type { NextConfig } from "next";

const codespaceOrigins =
  process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
    ? [
        `${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`,
        "localhost:3000",
      ]
    : [];

const nextConfig: NextConfig = {
  transpilePackages: ["@duely/shared"],
  experimental: {
    serverActions: {
      allowedOrigins: codespaceOrigins,
    },
  },
};

export default nextConfig;
