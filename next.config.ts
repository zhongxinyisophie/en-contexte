import type { NextConfig } from "next";

// Normal local/server builds keep their existing URLs. Pages builds are static
// and use the repository subpath supplied by the deployment workflow.
const nextConfig: NextConfig =
  process.env.GITHUB_PAGES === "true"
    ? {
        output: "export",
        basePath: process.env.NEXT_PUBLIC_BASE_PATH || "/en-contexte",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {};

export default nextConfig;
